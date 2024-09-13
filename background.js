let currentData;
let tabId;

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startParsing") {
    new Promise((resolve, reject) => {
      chrome.tabs.query(
        { pinned: true, url: "https://agency.dream-singles.com/*" },
        function (tabs) {
          if (tabs.length === 0) {
            chrome.tabs.create(
              {
                url: "https://agency.dream-singles.com/",
                active: true,
              },
              function (tab) {
                chrome.tabs.update(tab.id, { pinned: true, active: true });
                tabId = tab.id;
                resolve();
              }
            );
          } else {
            tabId = tabs[0].id;
            if (!tabs[0].pinned) {
              chrome.tabs.update(tabId, { pinned: true });
            }
            if (!tabs[0].active) {
              chrome.tabs.update(tabId, { active: true });
            }
            resolve();
          }
        }
      );
    }).then(() => {
      const { startDate, endDate, sheetId, log, pass } = message;
      currentData = {
        startDate,
        endDate,
        sheetId,
        log,
        pass,
      };
      console.log(currentData);

      startDreamSinglesLog(log, pass);
    });
  } else if (message.action === "clearStorage") {
    tabId = null;
    currentData = null;
    console.log("Storage cleared");
  }
});

async function startDreamSinglesLog(logDS, passDS) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (logDS, passDS) => {
        setTimeout(() => {
          document.getElementById("_username").value = logDS;
          document.getElementById("_password").value = passDS;
          document.querySelector(".btn.btn-info").click();
        }, 5000);
      },
      args: [logDS, passDS],
    });
    console.log("Login script executed");
    setTimeout(() => {
      parseElements(
        new Date(currentData.startDate),
        new Date(currentData.endDate)
      );
    }, 10000);
  } catch (error) {
    console.error("Error executing login script:", error);
  }
}

function parseElements(startDate, endDate) {
  const dates = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const allParsedData = [];

  const parseNextDate = async () => {
    if (dates.length === 0) {
      // All dates processed, update the sheet
      await updateSheetDB(allParsedData, currentData.sheetId);
      return;
    }

    const date = dates.shift();
    const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (formattedDate) => {
          window.location.href = `https://agency.dream-singles.com/finances/bonuses?form%5BstartDate%5D=${formattedDate}&form%5BendDate%5D=${formattedDate}&form%5Btype%5D=0&form%5BprofileId%5D=0&form%5BgroupBy%5D=2&form%5Bextra%5D=&`;
        },
        args: [formattedDate],
      });
      console.log(`Navigating to date: ${formattedDate}`);

      const onTabUpdated = async (tabIdUpdated, changeInfo, tab) => {
        if (
          tabIdUpdated === tabId &&
          changeInfo.status === "complete" &&
          tab.url.includes(formattedDate)
        ) {
          chrome.tabs.onUpdated.removeListener(onTabUpdated);

          const data = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
              let moneyPerDay = [];
              document.querySelectorAll("tr").forEach((element) => {
                moneyPerDay.push(element.textContent);
              });
              return moneyPerDay;
            },
          });

          if (data && data.length > 0) {
            const moneyPerDay = data[0].result;

            if (moneyPerDay.length === 0) {
              console.log("No data parsed");
            } else {
              const formattedResults = moneyPerDay
                .map((item) => {
                  const match = item.match(/\[.*?\]\s*(.*?)\s*\$([0-9.,]+)/);
                  if (match) {
                    const name = match[1].trim();
                    const amount = Number(match[2].replace(/,/g, "")); // Convert to number
                    return { name, amount, date: formattedDate };
                  }
                })
                .filter(Boolean);

              console.log("Formatted results:", formattedResults);
              allParsedData.push(...formattedResults);
            }
          }

          parseNextDate();
        }
      };

      chrome.tabs.onUpdated.addListener(onTabUpdated);
    } catch (error) {
      console.error(`Error parsing elements for date ${formattedDate}:`, error);
      parseNextDate();
    }
  };

  parseNextDate();
}

function columnToLetter(column) {
  let temp;
  let letter = "";
  while (column >= 0) {
    temp = column % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = Math.floor(column / 26) - 1;
  }
  return letter;
}

function updateSheetDB(data, sheetId) {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    if (chrome.runtime.lastError || !token) {
      console.error(chrome.runtime.lastError);
      return;
    }

    // Grouping data by months
    const dataByMonth = data.reduce((acc, item) => {
      const month = item.date.slice(5, 7) + "." + item.date.slice(2, 4); // Convert to MM.YYYY
      if (!acc[month]) acc[month] = [];
      acc[month].push(item);
      return acc;
    }, {});

    Object.entries(dataByMonth).forEach(([month, items]) => {
      const range = `${month}!A1:AF`; // Sheet should be named in the format MM.YYYY

      // Fetch existing data from the sheet
      fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      )
        .then((response) => response.json())
        .then((existingData) => {
          const values = existingData.values || [];

          // Create a map of names and their row indices
          const nameToRowMap = values.reduce((map, row, index) => {
            if (row[0]) {
              map[row[0].trim()] = index;
            }
            return map;
          }, {});

          // Prepare updates for specific cells
          const updates = [];

          // Process each item and prepare an update for the corresponding cell
          items.forEach((item) => {
            const day = parseInt(item.date.split("-")[2], 10); // Extract day from the date
            const rowIndex = nameToRowMap[item.name.trim()];

            if (rowIndex !== undefined) {
              // Update the cell with the corresponding daily column
              const colIndex = day; // Adjust column index, A = 0
              const amount = parseFloat(item.amount); // Convert to number
              if (amount && !isNaN(amount)) {
                const colLetter = columnToLetter(colIndex); // Use columnToLetter function
                const cellRange = `${month}!${colLetter}${rowIndex + 1}`;
                console.log(`Updating range: ${cellRange}`); // Log the range
                updates.push({
                  range: cellRange,
                  majorDimension: "ROWS",
                  values: [[amount]],
                });
              }
            }
          });

          // Prepare the batch update request
          const batchUpdateRequest = {
            valueInputOption: "RAW",
            data: updates,
          };

          // Execute the batch update
          fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchUpdate`,
            {
              method: "POST",
              headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(batchUpdateRequest),
            }
          )
            .then((response) => response.json())
            .then((result) => {
              console.log("SheetDB updated:", result);
            })
            .catch((error) => {
              console.error("Error updating SheetDB:", error);
              console.error(
                "Batch update request:",
                JSON.stringify(batchUpdateRequest)
              );
            });
        })
        .catch((error) => {
          console.error("Error fetching existing data:", error);
        });
    });
  });
}
