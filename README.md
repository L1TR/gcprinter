# gcprinter
GSN Coupons, Inc. Printer

Reference jquery and gcprinter.min.js
```
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script src="https://cdn.gsngrocers.com/script/gcprinter/gcprinter.min.js"></script>
```

To Print:
```
gcprinter.print(chainId, couponsArray);
```

## API

### gcprinter#print(chainId, couponsArray)
print coupon provided site or chainid and coupons array

### gcprinter#printWithToken(token)
print coupon provided a token

### gcprinter#hasPlugin
determine if plugin is installed

### gcprinter#getDeviceId
get the plugin device id

### gcprinter#checkInstall(successCallback, failCallback)
allow callback to check if coupon printer is installed

### gcprinter#isPrinterSupported
determine if printer is supported (not pdf/xps/virtual printer etc..)

### gcprinter#isPluginBlocked
determine if plugin is blocked

### gcprinter#isWebSocket
determine if plugin uses websocket

### gcprinter#getStatus
get the current status code

### gcprinter#getDownload
get the plugin download url
pluglin automatically detect if mac or windows and return appropriate URL

### gcprinter#on('printing', evt)
Event occur before print began
* evt.cancel - set true to cancel
* evt.data - server-side response

### gcprinter#on('printed', status)
status - print control status

### gcprinter#on('printfail', data)
data - server response with information on why print failed

Debug to page: https://gsn.github.io/gcprinter/example?debug
Debug to console: https://gsn.github.io/gcprinter/example

That is all!