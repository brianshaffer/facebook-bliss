// communicate with inject.js
chrome.runtime.onMessage.addListener( function(request,sender,sendResponse){
  if( request.message === "prepareSession" ){
    console.log('preparing session');
    localStorage.setItem('status', 'ready');
  }
  if( request.message === "suspendSession" ){
    console.log('preparing session');
    localStorage.setItem('status', 'stopped');
  }
  if( request.message === "checkSession" ){
    console.log('checking session status');
    var status = localStorage.getItem('status');
    console.log(status);
    sendResponse( {status:status} );
  }
  if( request.message === "launchReview" ){
    chrome.tabs.create({url: 'https://chrome.google.com/webstore/detail/kehoefkenbpccoekhkblhjiecfmficok/reviews'});
  }
});