document.querySelector("#begin").addEventListener("click", function(){
  console.log('clicked begin');
  chrome.runtime.sendMessage({message: "prepareSession"}, function (response) {
    console.log('done');
  });
  chrome.tabs.create({url: 'https://facebook.com'});
});