chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "parseData") {
    const { startDate, endDate } = message;
    window.location.href = `https://agency.dream-singles.com/finances/bonuses?form%5BstartDate%5D=${startDate}&form%5BendDate%5D=${endDate}&form%5Btype%5D=0&form%5BprofileId%5D=0&form%5BgroupBy%5D=2&form%5Bextra%5D=&form%5B_token%5D=sGWwXsWA_6RjARANm4b__Rx4k8-_NtyKxU_8DY3rZ6Q`;
  }
});
