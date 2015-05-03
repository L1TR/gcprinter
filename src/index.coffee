Emitter = require('emitter')
trim = require('trim')
debug = require('debug')
log = debug('gcprinter')
win = window
isReady = false
isSecureSite = win.location.protocol.indexOf("https") >= 0
initRequiredMsg = 'because plugin has not been initialized'

###*
# gciprinter
###
class gciprinter
  doc: win.document
  key: 'new'
  api: 'https://clientapi.gsn2.com/api/v1/ShoppingList/CouponPrint'
  hasInit: false
  debug: debug
  ###*
   * create a new instance of gciprinter
   * @return {Object}
  ###
  constructor: ->
    self = @
    # coupons inc require that we always load script
    sc = "https://cdn.cpnscdn.com/static/libraries/js/printcontrol_v3"
    scExtension = if debug.enabled('gcprinter') then ".js" else ".min.js"
    jQuery.ajax
      type: 'GET'
      url: "#{sc}#{scExtension}"
      dataType: 'script'
      contentType: 'application/json'
      success: ->
        setTimeout ->
          gcprinter.init()
        , 100

    # document not ready means we can do document write
    if !isReady
      myHtml = '<input type="hidden" id="https-supported" name="https-supported" value="true">'
      document.write "<!--[if (lte IE 9) & (cpbrkpie) & (gte cpbrkpie 5.0200)]>\n#{myHtml}\n<![endif]-->"
  ###*
   * Log a message
   * @param  {string} msg message
   * @return {Object}    
  ###
  log: (msg) ->
    self = @
    log msg
    return self
  ###*
   * print coupon provided site or chainid and coupons array
   * @param  {Number} siteId  Site or Chain Id
   * @param  {Array}  coupons array of manufacturer coupon codes
   * @return {Object} 
  ###
  print: (siteId, coupons) ->
    self = @
    if !self.hasInit
      gcprinter.log "print - false - #{initRequiredMsg}"
      return false
    win.gcprinterCallback = self.printCallback
    deviceId = self.getDeviceId()
    payload = trim(encodeURIComponent(coupons.join(',')))
    if (payload.length > 0)
      jQuery.ajax
        type: 'GET'
        url: "#{self.api}/#{siteId}/#{deviceId}?callback=?&coupons=#{payload}"
        dataType: 'jsonp'
      .done (svrRsp)->
        if (svrRsp.Success)
          evt = {cancel: false, data: svrRsp}
          gcprinter.emit('printing', evt)
          if !evt.cancel
            gcprinter.printWithToken svrRsp.Token, svrRsp
        else
          gcprinter.emit('printfail', svrRsp)
    else
      gcprinter.log "printcancel - no coupon payload"
      gcprinter.emit('printcancel')

    return true
  ###*
   * print coupon provided a token
   * @param  {string} printToken token
   * @param  {Object} rsp        server side response object
   * @return {Object}           
  ###
  printWithToken: (printToken, rsp) ->
    self = @
    if (printToken != 'no token')
      # should have already init the printer
      COUPONSINC.printcontrol.printCoupons printToken, (e)->
        gcprinter.log "printed #{e}"
        gcprinter.emit 'printed', e, rsp
    else
      gcprinter.emit 'printed', 'no token', rsp

    return self
  ###*
   * allow callback to check if coupon printer is installed
   * @param  {Function} fnSuccess 
   * @param  {Function} fnFail    
   * @return {Object}          
  ###
  checkInstall: (fnSuccess, fnFail) ->
    self = @
    fn = COUPONSINC.printcontrol.installCheck(self.key)
    jQuery.when(fn).then fnSuccess, fnFail
    @  
  ###*
   * determine if plugin is installed
   * @return {Boolean}
  ###
  hasPlugin: () ->
    self = @
    if !self.hasInit
      gcprinter.log "hasPlugin - false - #{initRequiredMsg}"
      return false
    return COUPONSINC.printcontrol.isPrintControlInstalled()
  ###*
   * get the plugin device id
   * @return {Object}
  ###
  getDeviceId: () ->
    self = @
    if !self.hasInit
      gcprinter.log "getDeviceId - 0 - #{initRequiredMsg}"
      return 0
    return COUPONSINC.printcontrol.getDeviceID()
  ###*
   * determine if printer is supported (not pdf/xps/virtual printer etc..)
   * @return {Boolean}
  ###
  isPrinterSupported: () ->
    self = @
    if !self.hasInit
      gcprinter.log "isPrinterSupported - false - #{initRequiredMsg}"
      return false
    return COUPONSINC.printcontrol.isPrinterSupported()
  ###*
   * get the current status code
   * @return {string} status code
  ###
  getStatus: () ->
    self = @
    if !self.hasInit
      gcprinter.log "getStatus - false - #{initRequiredMsg}"
      return false
    return COUPONSINC.printcontrol.getStatusCode()
  ###*
   * initialize COUPONSINC object
   * @return {Object}
  ###
  init: () ->
    self = @
    if !gcprinter.hasInit and COUPONSINC?
      gcprinter.log "init starting"
      cb = ->
        gcprinter.log "init completed"
        gcprinter.hasInit = true
        gcprinter.emit('initcomplete', @)
      jQuery.when(COUPONSINC.printcontrol.init(self.key, isSecureSite)).done cb
    return self

Emitter(gciprinter.prototype)
if win.gcprinter?
  gcprinter = win.gcprinter
else
  gcprinter = new gciprinter()

jQuery(document).ready ->
  isReady = true
  gcprinter.init()

win.gcprinter = gcprinter
module.exports = gcprinter