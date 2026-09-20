function handler(event) {
  var request = event.request;
  // Keep missing assets as errors; only browser routes get the SPA document.
  var last = request.uri.substring(request.uri.lastIndexOf('/') + 1);
  if (last.indexOf('.') === -1) request.uri = '/index.html';
  return request;
}
