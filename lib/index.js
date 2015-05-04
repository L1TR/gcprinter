// Generated by CoffeeScript 1.9.2
var Emitter, debug, gciprinter, gcprinter, initRequiredMsg, isDocReady, isSecureSite, log, trim, win;

Emitter = require('emitter');

trim = require('trim');

debug = require('debug');

log = debug('gcprinter');

win = window;

isDocReady = false;

isSecureSite = win.location.protocol.indexOf("https") >= 0;

initRequiredMsg = 'because plugin has not been initialized';


/**
 * gciprinter
 */

gciprinter = (function() {
  gciprinter.prototype.doc = win.document;

  gciprinter.prototype.key = 'new';

  gciprinter.prototype.api = 'https://clientapi.gsn2.com/api/v1/ShoppingList/CouponPrint';

  gciprinter.prototype.isReady = false;

  gciprinter.prototype.debug = debug;

  gciprinter.prototype.isWindows = navigator.platform.indexOf('Win') > -1;

  gciprinter.prototype.isMac = navigator.platform.indexOf('Mac') > -1;

  gciprinter.prototype.dl = {
    win: "http://cdn.coupons.com/ftp.coupons.com/partners/CouponPrinter.exe",
    mac: "http://cdn.coupons.com/ftp.coupons.com/safari/MacCouponPrinterWS.dmg"
  };


  /**
   * create a new instance of gciprinter
   * @return {Object}
   */

  function gciprinter() {
    var myHtml, sc, scExtension, self;
    self = this;
    if (!isDocReady) {
      myHtml = '<input type="hidden" id="https-supported" name="https-supported" value="true">';
      document.write("<!--[if (lte IE 9) & (cpbrkpie) & (gte cpbrkpie 5.0200)]>\n" + myHtml + "\n<![endif]-->");
    }
    sc = "https://cdn.cpnscdn.com/static/libraries/js/printcontrol_v3";
    scExtension = debug.enabled('gcprinter') ? ".js" : ".min.js";
    jQuery.ajax({
      type: 'GET',
      url: "" + sc + scExtension,
      dataType: 'script',
      contentType: 'application/json',
      success: function() {
        return setTimeout(function() {
          return gcprinter.init();
        }, 100);
      }
    });
  }


  /**
   * Log a message
   * @param  {string} msg message
   * @return {Object}
   */

  gciprinter.prototype.log = function(msg) {
    var self;
    self = this;
    log(msg);
    return self;
  };


  /**
   * print coupon provided site or chainid and coupons array
   * @param  {Number} siteId  Site or Chain Id
   * @param  {Array}  coupons array of manufacturer coupon codes
   * @return {Object}
   */

  gciprinter.prototype.print = function(siteId, coupons) {
    var deviceId, payload, self;
    self = this;
    if (!self.isReady) {
      gcprinter.log("print - false - " + initRequiredMsg);
      return false;
    }
    deviceId = self.getDeviceId();
    if (deviceId < 1) {
      gcprinter.log("printinvalid - bad device id " + deviceId);
      gcprinter.emit('printinvalid', 'gsn-device');
      return;
    }
    payload = trim((coupons || []).join(','));
    if (payload.length > 0) {
      payload = encodeURIComponent(payload);
      jQuery.ajax({
        type: 'GET',
        url: self.api + "/" + siteId + "/" + deviceId + "?callback=?&coupons=" + payload,
        dataType: 'jsonp'
      }).done(function(svrRsp) {
        var evt;
        if (svrRsp.Success) {
          evt = {
            cancel: false
          };
          if (!evt.cancel) {
            gcprinter.emit('printing', evt, svrRsp);
            return gcprinter.printWithToken(svrRsp.Token, svrRsp);
          } else {
            return gcprinter.emit('printfail', 'gsn-cancel', svrRsp);
          }
        } else {
          return gcprinter.emit('printfail', 'gsn-server', svrRsp);
        }
      });
    } else {
      gcprinter.log("printinvalid - no coupon payload");
      gcprinter.emit('printinvalid', 'gsn-no-coupon');
    }
    return true;
  };


  /**
   * print coupon provided a token
   * @param  {string} printToken token
   * @param  {Object} rsp        server side response object
   * @return {Object}
   */

  gciprinter.prototype.printWithToken = function(printToken, rsp) {
    var self;
    self = this;
    COUPONSINC.printcontrol.printCoupons(printToken, function(e) {
      gcprinter.log("printed " + e);
      if (e === 'blocked') {
        return gcprinter.emit('printfail', e, rsp);
      } else {
        return gcprinter.emit('printed', e, rsp);
      }
    });
    return self;
  };


  /**
   * allow callback to check if coupon printer is installed
   * @param  {Function} fnSuccess 
   * @param  {Function} fnFail    
   * @return {Object}
   */

  gciprinter.prototype.checkInstall = function(fnSuccess, fnFail) {
    var fn, self;
    self = this;
    fn = COUPONSINC.printcontrol.installCheck(self.key);
    jQuery.when(fn).then(fnSuccess, fnFail);
    return this;
  };


  /**
   * determine if plugin is installed
   * @return {Boolean}
   */

  gciprinter.prototype.hasPlugin = function() {
    var self;
    self = this;
    if (!self.isReady) {
      gcprinter.log("hasPlugin - false - " + initRequiredMsg);
      return false;
    }
    return COUPONSINC.printcontrol.isPrintControlInstalled();
  };


  /**
   * get the plugin device id
   * @return {Object}
   */

  gciprinter.prototype.getDeviceId = function() {
    var self;
    self = this;
    if (!self.isReady) {
      gcprinter.log("getDeviceId - 0 - " + initRequiredMsg);
      return 0;
    }
    return COUPONSINC.printcontrol.getDeviceID();
  };


  /**
   * determine if printer is supported (not pdf/xps/virtual printer etc..)
   * @return {Boolean}
   */

  gciprinter.prototype.isPrinterSupported = function() {
    var self;
    self = this;
    if (!self.isReady) {
      gcprinter.log("isPrinterSupported - false - " + initRequiredMsg);
      return false;
    }
    return COUPONSINC.printcontrol.isPrinterSupported();
  };


  /**
   * determine if plugin is blocked
   * @return {Boolean}
   */

  gciprinter.prototype.isPluginBlocked = function() {
    var result, self;
    self = this;
    if (!self.isReady) {
      gcprinter.log("isPluginBlocked - false - " + initRequiredMsg);
      return false;
    }
    result = !self.isWebSocket();
    if (result) {
      result = COUPONSINC.printcontrol_plugin.isPluginBlocked();
    }
    return result;
  };


  /**
   * determine if plugin uses websocket
   * @return {Boolean}
   */

  gciprinter.prototype.isWebSocket = function() {
    var self;
    self = this;
    if (!self.isReady) {
      gcprinter.log("isWebSocket - false - " + initRequiredMsg);
      return false;
    }
    return COUPONSINC.printcontrol.getManager() === 'socket';
  };


  /**
   * get the current status code
   * @return {string} status code
   */

  gciprinter.prototype.getStatus = function() {
    var self;
    self = this;
    if (!self.isReady) {
      gcprinter.log("getStatus - false - " + initRequiredMsg);
      return false;
    }
    return COUPONSINC.printcontrol.getStatusCode();
  };


  /**
   * get the plugin download url
   * @param  {Boolean} isWindows true if windows
   * @return {[string}            the download URL
   */

  gciprinter.prototype.getDownload = function(isWindows) {
    var self;
    self = this;
    if (isWindows || self.isWindows) {
      return self.dl.win;
    }
    return self.dl.mac;
  };


  /**
   * initialize COUPONSINC object
   * @return {Object}
   */

  gciprinter.prototype.init = function() {
    var cb, self;
    self = this;
    if (!gcprinter.isReady && (typeof COUPONSINC !== "undefined" && COUPONSINC !== null)) {
      gcprinter.log("init starting");
      cb = function() {
        gcprinter.log("init completed");
        gcprinter.isReady = true;
        return gcprinter.emit('initcomplete', this);
      };
      jQuery.when(COUPONSINC.printcontrol.init(self.key, isSecureSite)).done(cb);
    }
    return self;
  };

  return gciprinter;

})();

Emitter(gciprinter.prototype);

if (win.gcprinter != null) {
  gcprinter = win.gcprinter;
} else {
  gcprinter = new gciprinter();
}

jQuery(document).ready(function() {
  isDocReady = true;
  return gcprinter.init();
});

win.gcprinter = gcprinter;

module.exports = gcprinter;