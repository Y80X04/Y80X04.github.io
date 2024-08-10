// загрузка данных пользователя для закэшированых страниц
// может использовать метод addAuthUserCallback для авторизованных пользователей
// и доп парамтеры

(function($){
  var options = {
    // params by init
    lang: '', // default templates lang

    headerBlock: '#user_menu',
    menuDropdownBlock: '#user_menu_nav',
    feedbackButtonBlock: '#show_support_form',

    _isAuthorized: false,

    // callbacks after userData load
    _authUserCallbackList: ['_setMenuDropdown', '_setFeedbackButton'], // callback after userData load

    init: function() {
      this._loadUserData();
    },

    addAuthUserCallback: function(callbackName) {
      this._authUserCallbackList.push(callbackName);

      return options;
    },

    _getRequestUrl: function(url, withParams) {
      // pageParams - для прокидывания параметров страницы в сессию
      var pageParams = get_params(); // get_params общая функция из wn/js/functions1.0.js
      var lang = this.lang ? this.lang.toString() : '';
      return withParams ? lang + url + '?' + pageParams : lang + url;
    },

    _loadUserData: function() {
      var requestUrl = this._getRequestUrl('/scripts/ajax_wn_page_userdata.pl', 'withParams');
      var that = this;

      $.post(requestUrl, function( data ) {
        that._isAuthorized = data && !data.not_authorized;

        if(!data) {
          return;
        }

        that._setHeader(data);

        // если есть коллбэк, например для цен - задается в шаблоне:
        if( that._isAuthorized && that._authUserCallbackList.length > 0 ) {//список колбеков 1783
          $.each(that._authUserCallbackList, function(i, callback) {
            if( typeof that[callback] === 'function' ) {
              // start callback
              that[callback]();
            }
          });
        }
      });
    },

    _setHeader: function(data) {
      // подпись к корзине в шапке
      // setCartCount прописана в functions1.0
      data.cartcount && parseInt(data.cartcount) && setTimeout(function() {
        return setCartCount(data.cartcount, 'ru');
      }, 1000);

      // для авторизованного пользователя
      if( !this._isAuthorized ) {
        return;
      }

      var userMenuSelector = this.headerBlock.toString();
      var $userMenu = $(userMenuSelector);
      var userMenuText = data.html_header;
      userMenuText && $userMenu.html(userMenuText);
    },

    _setMenuDropdown: function() {
      var requestUrl = this._getRequestUrl('/scripts/ajax_wn_page_user_menu.pl');
      var that = this;
      $.post(requestUrl, function( data ) {
        if( data && data.html ) {
          var userMenuDropdownSelector = that.menuDropdownBlock.toString();
          var $userMenuDropdown = $(userMenuDropdownSelector);
          var menuText = data.html;
          $userMenuDropdown.html(menuText);
          ajaxPromocode(); // in function1.0.js
          ajaxTelegramBot(); // in function1.0.js
          //that._setMenuDropdownToggle();
        }
      });
    },

    // _setMenuDropdownToggle: function() {
    //   var userMenuDropdownSelector = this.menuDropdownBlock.toString();
    //   $(userMenuDropdownSelector).find('#dropdownMenu5').attr('data-toggle', 'dropdown');
    // },

    _setFeedbackButton: function() {
      var requestUrl = this._getRequestUrl('/scripts/ajax_wn_page_feedback_button.pl');
      var that = this;
      $.post(requestUrl, function( data ) {
        if( data && data.html ) {
          var userFeedbackSelector = that.feedbackButtonBlock.toString();
          var $userFeedback = $(userFeedbackSelector);
          var feedbackText = data.html;
          $userFeedback.html(feedbackText);
        }
      });
    },
  };
  // end of options

  $.fn.userData = function(opt) { // as jquery plugin
    $.extend(options, opt);
    options['init']();
    return options;
  };
}(jQuery));
