window.onload = () => {
  chrome.storage.local.get(["startDate", "endDate", "sheetId"], (data) => {
    if (data.startDate) {
      document.getElementById("startDate").value = data.startDate;
    }
    if (data.endDate) {
      document.getElementById("endDate").value = data.endDate;
    }
    if (data.sheetId) {
      document.getElementById("sheetId").value = data.sheetId;
    }
  });

  document.getElementById("startDate").addEventListener("input", () => {
    const startDate = document.getElementById("startDate").value;
    chrome.storage.local.set({ startDate });
    const { year, month, day } = splitDate(startDate);
    console.log(`Start Date: Year: ${year}, Month: ${month}, Day: ${day}`);
    validateDates();
  });

  document.getElementById("endDate").addEventListener("input", () => {
    const endDate = document.getElementById("endDate").value;
    chrome.storage.local.set({ endDate });
    const { year, month, day } = splitDate(endDate);
    console.log(`End Date: Year: ${year}, Month: ${month}, Day: ${day}`);
    validateDates();
  });

  document.getElementById("sheetId").addEventListener("input", () => {
    const sheetId = document.getElementById("sheetId").value;
    chrome.storage.local.set({ sheetId });
  });
};

document.getElementById("startParsing").addEventListener("click", async () => {
  const log = document.getElementById("DsLogin").value;
  const pass = document.getElementById("DsPass").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const sheetId = document.getElementById("sheetId").value;

  if (startDate && endDate && sheetId) {
    const startComponents = splitDate(startDate);
    const endComponents = splitDate(endDate);

    if (!validateDates()) {
      return;
    }

    chrome.storage.local.set({ startDate, endDate, sheetId, log, pass }, () => {
      console.log("Dates and sheet ID saved");
    });

    chrome.runtime.sendMessage({
      action: "startParsing",
      startDate,
      endDate,
      sheetId,
      log,
      pass,
      startComponents,
      endComponents,
    });
  } else {
    alert("Please fill all the fields");
  }
});

document.getElementById("clearStorage").addEventListener("click", () => {
  chrome.storage.local.clear(() => {
    console.log("Local storage cleared");
    document.getElementById("startDate").value = null;
    document.getElementById("endDate").value = null;
    document.getElementById("sheetId").value = null;
    chrome.runtime.sendMessage({ action: "clearStorage" });
  });
});

function splitDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return { year, month, day };
}

function validateDates() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  if (startDate && endDate) {
    const startComponents = splitDate(startDate);
    const endComponents = splitDate(endDate);

    if (
      startComponents.month !== endComponents.month ||
      startComponents.year !== endComponents.year
    ) {
      alert("Please select dates within one month.");
      chrome.runtime.sendMessage({ action: "clearStorage" });
      document.getElementById("startDate").value = null;
      document.getElementById("endDate").value = null;

      return false;
    }
  }

  return true;
}
