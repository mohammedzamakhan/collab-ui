import * as angular from 'angular';
import { KeyCodes } from '../dropdown/keyCodes';

const moment = require('moment');

csTimepicker.$inject = ['$document', '$window', '$timeout', '$compile', '$exceptionHandler', '$templateRequest'];
export function csTimepicker($document, $window, $timeout, $compile, $exceptionHandler, $templateRequest) {
  let directive = {
    restrict: 'AC',
    require: 'ngModel',
    transclude: true,
    scope: {
      selectedTime: '=ngModel',
      type: '@',
      name: '@',
      value: '@',
      id: '@',
      hour: '@',
      minutes: '@',
      meridian: '@',
      twentyfourhour: '@',
      messages: '=?csTimepickerMessages', // Object containing validation key/value pairs,
      label: '@?csTimepickerLabel',
      groupSize: '@?csTimepickerGroupSize', // Size class for outer cs-timepicker-group container
      helpText: '@?csTimepickerHelpText', // Text for help text
      secondaryLabel: '@?csTimepickerSecondaryLabel', // Secondary label text
      size: '@?csTimepickerSize', // Size class for input element
      nested: '@?csTimepickerNested', // Indent the input
      warning: '=?csTimepickerWarning', // Expression or Boolean to show warning message
      warningMessage: '@?csTimepickerWarningMessage', // Warning message
    },
    compile: compile,
  };
  let eventNs;
  let setOptions = function (scope, iElement, iAttrs, ngModel) {
    scope.twentyfourhour = scope.$eval(iAttrs.twentyfourhour) || false;
    scope.format = scope.twentyfourhour ? 'HH:mm' : 'hh:mm A';
    scope.step = iAttrs.step || '1';
    if (!scope.hours && !scope.minutes && scope.selectedTime) {
      scope.selectedTime = moment(scope.selectedTime, ['HH:mm', 'hh:mm A']).format(scope.format);
      let time = moment(scope.selectedTime, scope.format);
      scope.minutes = time.format('mm');
      if (scope.twentyfourhour) {
        scope.hours = time.format('HH');
      } else {
        scope.hours = time.format('hh');
        scope.meridian = time.format('A');
      }
    }
  };

  function compile(tElement, tAttrs, transclude) {
    return {
      pre: preLink,
      post: postLink,
    };

    function preLink(scope, iElement, iAttrs, ngModel) {
      iElement.addClass('cui-input');
      // Wrap input with the .cui-input-group element if not in formly form
      if (!scope.formly) {
        let type = scope.type;
        let show = scope.ngShow;
        let inputGroup = '';
        if (scope.csToggle && scope.type === 'checkbox') {
          iElement.addClass('cui-toggle__input');
          inputGroup = '<div class="cui-input-group cui-toggle" ng-show = "' + show + '"></div>';
        } else {
          iElement.addClass('cui-' + type + '__input');
          inputGroup = '<div class="cui-input-group cui-' + type + '" ng-show = "' + show + '"></div>';
        }
        let compiledGroup = $compile(inputGroup)(scope);
        iElement.wrap(compiledGroup);
      }

      // Wrap input with the .cui-input-group and add the error messages, then do the same with
      // the .cui-timepicker-group element and timepicker dropdown
      let compiledInputGroup = $compile('<div class="cui-input-group"></div>')(scope);
      iElement.wrap(compiledInputGroup).addClass('cui-timepicker');

      let errorMessages = `
        <div class="cui-input__messages" ng-messages="error">
          <div class="message" ng-repeat="(key, value) in ::messages" ng-message="{{::key}}">{{::value}}</div>
        </div>
      `;
      let errorTemplate = angular.element(errorMessages);
      iElement.after(errorTemplate);
      $compile(errorTemplate)(scope);

      let compiledTimepickerGroup = $compile('<div class="cui-timepicker-container"></div>')(scope);
      iElement.wrap(compiledTimepickerGroup);

      let html = `
        <div class="cui-event-overlay">
          <div class="cui-event-overlay__children">
            <div class="cui-timepicker__dropdown-container">
              <div class="cui-timepicker__dropdown" ng-if="opened">
                <div class="inline-flex">
                  <div>
                    <button class="cui-button cui-button--none" ng-mouseup="increaseHour()">
                      <i class="icon icon-arrow-up_24"></i>
                    </button>
                    <input type="text" cs-tp-name="hh" ng-model="hours" maxlength="2">
                    <button class="cui-button cui-button--none" ng-mouseup="decreaseHour()">
                      <i class="icon icon-arrow-down_24"></i>
                    </button>
                  </div>
                  <span>:</span>
                  <div>
                    <button class="cui-button cui-button--none" ng-mouseup="increaseMinutes()">
                      <i class="icon icon-arrow-up_24"></i>
                    </button>
                    <input type="text" cs-tp-name="mm" ng-model="minutes" maxlength="2">
                    <button class="cui-button cui-button--none" ng-mouseup="decreaseMinutes()">
                      <i class="icon icon-arrow-down_24"></i>
                    </button>
                  </div>
                  <div ng-if="!twentyfourhour">
                    <button class="cui-button cui-button--none" ng-mouseup="toggleMeridian()">
                      <i class="icon icon-arrow-up_24"></i>
                    </button>
                    <input type="text" cs-tp-name="ap" ng-model="meridian">
                    <button class="cui-button cui-button--none" ng-mouseup="toggleMeridian()">
                      <i class="icon icon-arrow-down_24"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Load the html through $templateRequest
      // Convert the html to an actual DOM node
      let template = angular.element(html);
      // Add the custom timepicker attribute to the directive element
      iElement.attr('cs-tp-name', 'time');
      // Append it to the directive element
      iElement.after(template);
      // And let Angular $compile it
      $compile(template)(scope);

      template.on('keydown', ($event) => {
        const focusableElements: any = template.find('input:visible');

        if ($event.which === KeyCodes.TAB && (($event.shiftKey && $event.target === focusableElements.first()[0]) || (!$event.shiftKey && $event.target === focusableElements.last()[0]))) {
          scope.opened = false;
          scope.$apply();
        }
      });
    }

    function postLink(scope, iElement, iAttrs, ngModel) {
      setOptions(scope, iElement, iAttrs, ngModel);
      eventNs = '.timePicker';
      if (ngModel && ngModel.$name) {
        eventNs += '-' + ngModel.$name;
        // Toggle .error and .warning classes on .cui-timepicker-container based on input states
        let name = scope.name;
        let form = ngModel.$name;
        let inputInvalid = '$parent.' + form + '.' + name + '.$invalid';
        let inputTouched = '$parent.' + form + '.' + name + '.$touched';
        let inputPristine = '$parent.' + form + '.' + name + '.$pristine';
        let inputWarning = 'warning';

        if (scope.messages) {
          name = scope.name;
          scope.error = ngModel.$error;
        }
        scope.$watchGroup([inputInvalid, inputWarning, inputTouched, inputPristine], function (newValues, oldValues) {
          if (oldValues !== newValues) {
            if (scope.secondaryLabel || scope.size) {
              // If secondary label or input size, .cui-timepicker-container is 2 levels up
              let parentElem = iElement.parent();
              parentElem.parent().toggleClass('warning', !!newValues[1]);
              parentElem.parent().toggleClass('error', !!newValues[0]);
            } else {
              // Toggle error class on .cui-timepicker-group
              iElement.parent().toggleClass('warning', !!newValues[1]);
              iElement.parent().toggleClass('error', !!newValues[0]);
            }
          }
        });
      }

      scope.opened = false;
      scope.disabledBool = convertStringBoolToBoolean(scope.isDisabled);

      scope.$watch('isDisabled', function (newValue, oldValue) {
        if (angular.isDefined(newValue)) {
          scope.disabledBool = convertStringBoolToBoolean(newValue);
        }
      });

      function convertStringBoolToBoolean(str) {
        let bool = false;
        if (String(str).toLowerCase() === 'true') {
          bool = true;
        }
        return bool;
      }

      let setTime = function () {
        if (scope.hours || scope.minutes || scope.meridian) {
          if (angular.isUndefined(scope.hours)) {
            scope.hours = scope.formatDigits(0);
          }
          if (angular.isUndefined(scope.minutes)) {
            scope.minutes = scope.formatDigits(0);
          }
          if (angular.isUndefined(scope.meridian)) {
            scope.meridian = 'AM';
          }
          if (scope.twentyfourhour) {
            scope.selectedTime = moment([scope.hours, ':', scope.minutes].join(''), scope.format).format(scope.format);
          } else {
            scope.selectedTime = moment([scope.hours, ':', scope.minutes, ' ', scope.meridian].join(''), scope.format).format(scope.format);
          }
          //Trigger ng-change for validation
          iElement.parent().find('[cs-tp-name="time"]').val(scope.selectedTime);
          iElement.trigger('change');
        }
      };

      scope.showTimepicker = function () {
        scope.opened = true;
      };

      scope.increaseHour = function () {
        let hours = scope.hours;
        if (scope.hours) {
          if (scope.twentyfourhour) {
            if (parseInt(hours, 10) < 23) {
              hours = parseInt(hours, 10) + 1;
            } else {
              hours = 0;
            }
          } else {
            if (parseInt(hours, 10) === 11) {
              scope.toggleMeridian();
            }
            if (parseInt(hours, 10) < 12) {
              hours = parseInt(hours, 10) + 1;
            } else if (parseInt(hours, 10) === 12) {
              hours = 1;
            }
          }
        } else {
          hours = (scope.twentyfourhour ? '0' : '1');
        }
        scope.hours = scope.formatDigits(hours);
        setTime();
      };

      scope.decreaseHour = function () {
        let hours = scope.hours;
        if (scope.hours) {
          if (scope.twentyfourhour) {
            if (parseInt(hours, 10) === 0) {
              hours = 23;
            } else {
              hours = parseInt(hours, 10) - 1;
            }
          } else {
            if (parseInt(hours, 10) === 12) {
              scope.toggleMeridian();
            }
            if (parseInt(hours, 10) === 1) {
              hours = 12;
            } else {
              hours = parseInt(hours, 10) - 1;
            }
          }
        } else {
          hours = (scope.twentyfourhour ? '0' : '1');
        }
        scope.hours = scope.formatDigits(hours);
        setTime();
      };

      scope.increaseMinutes = function () {
        let minutes = scope.minutes || '0';
        minutes = parseInt(minutes, 10) + parseInt(scope.step, 10);
        if (minutes > 59) {
          minutes = '00';
          scope.increaseHour();
        }
        scope.minutes = scope.formatDigits(minutes);
        setTime();
      };

      scope.decreaseMinutes = function () {
        let minutes = scope.minutes || '0';
        minutes = parseInt(minutes, 10) - parseInt(scope.step, 10);
        if (parseInt(minutes, 10) < 0) {
          minutes = 60 - parseInt(scope.step, 10);
          scope.decreaseHour();
        }
        scope.minutes = scope.formatDigits(minutes);
        setTime();
      };

      scope.toggleMeridian = function (value) {
        let meridian = scope.meridian || 'AM';
        if (value === undefined) {
          meridian = meridian === 'AM' ? 'PM' : 'AM';
        } else {
          meridian = value === true ? 'AM' : 'PM';
        }

        scope.meridian = meridian;
        setTime();
      };

      scope.scrubCharacters = function (value) {
        // integer only
        return value.toString().replace(/\D/g, '');
      };

      scope.formatDigits = function (value) {
        // set default
        value = value.toString() || '00';
        // integer only
        value = scope.scrubCharacters(value);
        // prepend zero for single digit
        value = (value.toString().length === 1 ? 0 : '') + value;
        return value;
      };

      scope.capHours = function (value) {
        let cap = scope.twentyfourhour ? 23 : 12;
        return (parseInt(value, 10) > cap) ? cap : value;
      };

      scope.capMinutes = function (value) {
        return (parseInt(value, 10) > 59) ? 59 : value;
      };

      scope.selectAll = function (event) {
        if (!$window.getSelection().toString()) {
          event.target.setSelectionRange(0, event.target.value.length);
        }
      };

      let documentActions = {
        keydown: function (event) {
          if ((event.keyCode || event.which) === KeyCodes.TAB) {
            let tabindex = event.shiftKey ? '-1' : '0';
            iElement.parent().find('[cs-tp-name="time"]').attr('tabIndex', tabindex);
          }
        },
        mousedown: function (event) {
          if (iElement !== event.target && !iElement.parent()[0].contains(event.target)) {
            scope.opened = false;
            iElement.parent().find('[cs-tp-name="time"]').attr('tabIndex', '0');
          }
        },
      };

      $document.on(Object.keys(documentActions).join(eventNs + ' ') + eventNs, function (event) {
        scope.$apply(function () {
          documentActions[event.type](event);
        });
      });

      let focusActions = {
        blur: {
          hh: function () {
            if (scope.hours) {
              scope.hours = scope.formatDigits(scope.hours);
            }
          },
          mm: function () {
            if (scope.minutes) {
              scope.minutes = scope.formatDigits(scope.minutes);
            } else {
              scope.minutes = scope.formatDigits(0);
            }
          },
          meridian: null,
        },
        focus: {
          time: function (event) {
            scope.showTimepicker();
            $timeout(function () {
              iElement.parent().find('[cs-tp-name="hh"]').focus();
            });
          },
          hh: function (event) {
            $timeout(function () {
              scope.selectAll(event);
            });
          },
          mm: function (event) {
            $timeout(function () {
              scope.selectAll(event);
            });
          },
          ap: function (event) {
            $timeout(function () {
              scope.selectAll(event);
            });
          },
        },
      },
        mouseActions = {
          mouseup: {
            hh: function () { },
            mm: function () { },
            ap: function () { },
          },
        },
        keyActions = {
          keydown: {
            hh: function (event) {
              if (/^[a-zA-Z]+$/.test(String.fromCharCode(event.keyCode)) || event.keyCode === KeyCodes.UP || event.keyCode === KeyCodes.DOWN) {
                event.preventDefault();
              }
            },
            mm: function (event) {
              if (/^[a-zA-Z]+$/.test(String.fromCharCode(event.keyCode)) || event.keyCode === KeyCodes.UP || event.keyCode === KeyCodes.DOWN) {
                event.preventDefault();
              }
            },
            ap: function (event) {
              if ((event.keyCode !== 16 && event.keyCode !== 9) || event.keyCode !== 9) {
                event.preventDefault();
                let keys = {
                  65: 'AM',
                  80: 'PM',
                };
                scope.meridian = keys[event.keyCode] || scope.meridian;
              }
            },
          },
          keyup: {
            hh: function (event) {
              if (event.keyCode === KeyCodes.UP || event.keyCode === KeyCodes.DOWN) {
                event.preventDefault();
                let keys = {
                  38: 'increase',
                  40: 'decrease',
                };
                scope[keys[event.keyCode] + 'Hour']();
              } else {
                scope.hours = scope.capHours(event.target.value);
              }
            },
            mm: function (event) {
              if (event.keyCode === KeyCodes.UP || event.keyCode === KeyCodes.DOWN) {
                event.preventDefault();
                let keys = {
                  38: 'increase',
                  40: 'decrease',
                };
                scope[keys[event.keyCode] + 'Minutes']();
              } else {
                scope.minutes = scope.capMinutes(event.target.value);
              }
            },
            ap: function (event) {
              if (event.keyCode === KeyCodes.UP || event.keyCode === KeyCodes.DOWN) {
                event.preventDefault();
                scope.meridian = (scope.meridian === 'AM') ? 'PM' : 'AM';
              }
            },
          },
        };

      let bindEvents = function (obj, el) {
        el = el || iElement;
        el.on(Object.keys(obj).join(eventNs + ' ') + eventNs, function (event) {
          let name = $(event.target).attr('cs-tp-name');
          if (obj[event.type] && typeof obj[event.type][name] === 'function') {
            scope.$apply(function (scope) {
              obj[event.type][name](event);
              setTime();
              // unbind events on $destroy
              scope.$on('$destroy', function () {
                el.off(Object.keys(obj).join(eventNs + ' ') + eventNs);
                $document.off(Object.keys(documentActions).join(eventNs + ' ') + eventNs);
              });
            });
          }
        });
      };

      $timeout(function () {
        bindEvents(keyActions, iElement.parent().find('[cs-tp-name]'));
        bindEvents(mouseActions, iElement.parent().find('[cs-tp-name]'));
        bindEvents(focusActions, iElement.parent().find('[cs-tp-name]'));
      });
    }
  }

  return directive;
}
