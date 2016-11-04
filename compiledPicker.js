'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MyDatePicker = function () {
	function MyDatePicker(element, config, callback) {
		_classCallCheck(this, MyDatePicker);

		this.element = element;
		this.submitCallback = callback;

		this.clearDates();
		this.clearTimes();
		this.initializeConfigParams(config);

		// Set static properties
		this.currentMonthDateElements = [];
		this.daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		this.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

		this.initializeContainer(element);
	}

	_createClass(MyDatePicker, [{
		key: 'setPresetsConfig',
		value: function setPresetsConfig(presets) {

			function getPeriodLabel(val) {
				var periodObj = {
					1: "Past",
					2: "Next"
				};
				return periodObj[val];
			}

			var i = void 0;
			this.presets = [];
			var label = void 0,
			    days = void 0;
			for (i = 0; i < presets.length; i++) {
				if (!presets[i].days || typeof presets[i].days !== "number") {
					continue;
				}
				if (!presets[i].period || presets[i].period !== 1 && presets[i].period !== 2) {
					presets[i].period = 1;
				}

				label = presets[i].label;
				if (!label || typeof label !== "string") {
					label = getPeriodLabel(presets[i].period) + " " + presets[i].days + " days";
					presets[i].label = label;
				}
				this.presets.push(presets[i]);
			}
		}
	}, {
		key: 'initializeConfigParams',
		value: function initializeConfigParams(config) {
			this.highlightOnHover = config.highlightOnHover;
			this.is_range = config.is_range || false;
			this.timeEnabled = config.timeEnabled || false;
			this.submitButton = config.submitButton || false;
			this.currentMonth = config.currentMonth || new Date().getMonth();
			this.currentYear = config.currentYear || new Date().getFullYear();
			this.yearRange = config.yearRange;
			this.infoLabel = config.label;
			if (!this.yearRange) {
				this.yearRange = {
					pastYear: 2000,
					futureYear: 2020
				};
			}
			if (config.defaultDate) {
				this.firstDate = config.defaultDate.firstDate;
				this.firstTime = {
					hour: this.firstDate.getHours(),
					minute: this.firstDate.getMinutes()
				};
				if (config.is_range) {
					this.secondDate = config.defaultDate.secondDate;
					this.secondTime = {
						hour: this.secondDate.getHours(),
						minute: this.secondDate.getMinutes()
					};
				}
			}

			if (config.is_range && config.presets) {
				this.setPresetsConfig(config.presets);
			}
		}
	}, {
		key: 'getDaysInMonth',
		value: function getDaysInMonth(month, year) {
			if (month == 1 && year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) {
				return 29;
			} else {
				return this.daysInMonths[month];
			}
		}
	}, {
		key: 'getFirstDayInMonth',
		value: function getFirstDayInMonth(month, year) {
			return new Date(year, month, 1).getDay();
		}
	}, {
		key: 'create',
		value: function create(name) {
			var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			var text = arguments[2];

			var temp = document.createElement(name);

			// !!!!!!!!!! do this using Symbol.iterator
			Object.keys(attributes).forEach(function (key) {
				temp.setAttribute(key, attributes[key]);
			});
			// .............

			if (text) {
				var textNode = document.createTextNode(text);
				temp.appendChild(textNode);
			}
			return temp;
		}
	}, {
		key: 'sortDates',
		value: function sortDates(obj) {
			if (obj.firstDate.getTime() > obj.secondDate.getTime()) {
				var tempDate = obj.firstDate;
				obj.firstDate = obj.secondDate;
				obj.secondDate = tempDate;
			}

			return obj;
		}
	}, {
		key: 'getFullDate',
		value: function getFullDate(dateObj, timeObj) {
			var date = new Date(dateObj);
			date.setHours(timeObj.hour, timeObj.minute);
			return date;
		}
	}, {
		key: 'submit',
		value: function submit() {
			var res = {};
			if (this.firstDate) {
				res.firstDate = this.getFullDate(this.firstDate, this.firstTime);
			}
			if (this.secondDate) {
				res.secondDate = this.getFullDate(this.secondDate, this.secondTime);
				res = this.sortDates(res);
			}
			if (Object.keys(res).length && this.submitCallback && typeof this.submitCallback === "function" && !this.rangeInProgress) {
				this.submitCallback(res);
				this.hideCalender();
			}
		}
	}, {
		key: 'reset',
		value: function reset() {
			this.clearDates();
			this.clearTimes();
			this.refreshCalender();
		}
	}, {
		key: 'showPreviousMonth',
		value: function showPreviousMonth() {
			this.currentMonth--;
			if (this.currentMonth < 0) {
				this.currentMonth = 11;
				this.currentYear--;
			}
			this.refreshCalender();
		}
	}, {
		key: 'showNextMonth',
		value: function showNextMonth() {
			this.currentMonth++;
			if (this.currentMonth > 11) {
				this.currentMonth = 0;
				this.currentYear++;
			}
			this.refreshCalender();
		}
	}, {
		key: 'switchMonth',
		value: function switchMonth(value) {
			this.currentMonth = value;
			this.refreshCalender();
		}
	}, {
		key: 'switchYear',
		value: function switchYear(value) {
			this.currentYear = value;
			this.refreshCalender();
		}
	}, {
		key: 'switchHour',
		value: function switchHour(hour, timeObj, event) {
			event.preventDefault();
			timeObj.hour = hour;
			this.refreshTime();
		}
	}, {
		key: 'switchMinute',
		value: function switchMinute(minute, timeObj, event) {
			timeObj.minute = minute;
			this.refreshTime();
		}
	}, {
		key: 'isDateInRange',
		value: function isDateInRange(tempDate, firstDate, secondDate) {
			if (tempDate.getTime() > firstDate.getTime() && tempDate.getTime() < secondDate.getTime()) {
				return true;
			} else if (tempDate.getTime() < firstDate.getTime() && tempDate.getTime() > secondDate.getTime()) {
				return true;
			}

			return false;
		}
	}, {
		key: 'isDateActive',
		value: function isDateActive(date, month, year) {
			if (this.firstDate && this.firstDate.getDate() == date && this.firstDate.getMonth() == month && this.firstDate.getFullYear() == year) {
				return true;
			} else if (this.secondDate && this.secondDate.getDate() == date && this.secondDate.getMonth() == month && this.secondDate.getFullYear() == year) {
				return true;
			}

			return false;
		}
	}, {
		key: 'makeElementActive',
		value: function makeElementActive(element) {
			if (element && element.classList) {
				element.classList.add("active");
			}
		}
	}, {
		key: 'clearDates',
		value: function clearDates() {
			this.firstDate = null;
			this.secondDate = null;
			this.firstDateElementIndex = null;
			this.secondDateElementIndex = null;
			this.rangeInProgress = false;
		}
	}, {
		key: 'clearTimes',
		value: function clearTimes() {
			this.firstTime = {
				hour: 0,
				minute: 0
			};
			this.secondTime = {
				hour: 0,
				minute: 0
			};
		}
	}, {
		key: 'presetClicked',
		value: function presetClicked(presetObj, event) {
			this.firstDate = presetObj.firstDate;
			this.secondDate = presetObj.secondDate;
			this.refreshInfo();
			this.submit();
		}
	}, {
		key: 'dateClicked',
		value: function dateClicked(element, actualIndex, day, month, year) {

			if (!this.firstDate) {
				this.firstDate = new Date(year, month, day);
				this.firstDateElementIndex = actualIndex;
				if (this.is_range) {
					this.rangeInProgress = true;
				}
			} else if (!this.secondDate && this.rangeInProgress) {
				this.secondDate = new Date(year, month, day);
				this.secondDateElementIndex = actualIndex;
				this.rangeInProgress = false;
			} else {
				this.clearDates();
				this.dateClicked(element, actualIndex, day, month, year);
				return;
			}

			this.refreshCalender();

			//check if submit doesn't button exists, trigger submit
			if (!this.submitButton) {
				this.submit();
			}
		}
	}, {
		key: 'dateHovered',
		value: function dateHovered(element, actualIndex, day, month, year) {
			if (!this.rangeInProgress) {
				return;
			}

			this.setIntraElementsColor(actualIndex, new Date(year, month, day));
		}
	}, {
		key: 'setIntraElementsColor',
		value: function setIntraElementsColor(actualIndex, tempDate) {
			var i = void 0;
			var start = void 0,
			    end = void 0;

			function dateHoveredInOtherMonth(firstDate, tempDate) {
				if (tempDate.getFullYear() > firstDate.getFullYear() || tempDate.getMonth() > firstDate.getMonth() && tempDate.getFullYear() == firstDate.getFullYear()) {
					return 2; // Future month
				} else if (tempDate.getFullYear() < firstDate.getFullYear() || tempDate.getMonth() < firstDate.getMonth() && tempDate.getFullYear() == firstDate.getFullYear()) {
					return 1; // Past Month
				} else {
					return 0;
				}
			}

			switch (dateHoveredInOtherMonth(this.firstDate, tempDate)) {
				case 2:
					start = 0;
					end = actualIndex;
					break;
				case 1:
					start = actualIndex;
					end = this.currentMonthDateElements.length;
					break;
				case 0:
					if (this.firstDateElementIndex < actualIndex) {
						start = this.firstDateElementIndex;
						end = actualIndex;
					} else {
						start = actualIndex;
						end = this.firstDateElementIndex;
					}
					break;
			}

			for (i = 0; i < this.currentMonthDateElements.length; i++) {
				if (i >= start && i <= end) {
					this.addClass(this.currentMonthDateElements[i], "inRange");
				} else {
					this.removeClass(this.currentMonthDateElements[i], "inRange");
				}
			}
		}
	}, {
		key: 'emptyContainer',
		value: function emptyContainer(container) {
			while (container.firstChild) {
				container.removeChild(container.firstChild);
			}
		}
	}, {
		key: 'addClass',
		value: function addClass(element, className) {
			element.classList.add(className);
		}
	}, {
		key: 'removeClass',
		value: function removeClass(element, className) {
			element.classList.remove(className);
		}
	}, {
		key: 'showCalender',
		value: function showCalender() {
			this.removeClass(this.mainElement, "hidden");
		}
	}, {
		key: 'hideCalender',
		value: function hideCalender() {
			this.addClass(this.mainElement, "hidden");
		}
	}, {
		key: 'toggleCalender',
		value: function toggleCalender() {
			this.mainElement.classList.toggle("hidden");
		}
	}, {
		key: 'refreshInfo',
		value: function refreshInfo() {
			var newInfo = this.generateInfoElement();
			this.container.replaceChild(newInfo, this.infoElement);
			this.infoElement = newInfo;
		}
	}, {
		key: 'refreshTime',
		value: function refreshTime() {
			// this.generateShowTimeElement(timeObj);
			var newTimeElement = this.generateTimeElement();
			this.mainElement.replaceChild(newTimeElement, this.timeElement);
			this.timeElement = newTimeElement;
			this.refreshInfo();
		}
	}, {
		key: 'refreshCalender',
		value: function refreshCalender() {
			var calender = this.generateCalender();
			this.container.replaceChild(calender, this.mainElement);
			this.mainElement = calender;

			this.refreshInfo();
		}
	}, {
		key: 'initializeContainer',
		value: function initializeContainer(element) {
			var _this = this;
			this.container = this.create("div", {
				class: "NNB_DatePicker"
			});
			this.infoElement = this.generateInfoElement();
			this.mainElement = this.generateCalender();

			this.container.appendChild(this.infoElement);
			this.container.appendChild(this.mainElement);

			element.innerHTML = '';
			element.appendChild(this.container);

			this.hideCalender();

			document.addEventListener("click", function (event) {
				_this.hideCalender();
			});

			this.container.addEventListener("click", function (event) {
				event.stopPropagation();
			});
		}
	}, {
		key: 'generateCalender',
		value: function generateCalender() {

			this.currentMonthDateElements = [];

			var main = this.create("div", {
				class: "main"
			});

			if (this.presets && this.presets.length) {
				var presetElement = this.generatePresetElement();
				main.appendChild(presetElement);
			}

			var actionsElement = this.generateActionsElement();
			main.appendChild(actionsElement);

			var monthYearHeader = this.generateMonthYearHeader();
			main.appendChild(monthYearHeader);

			var dayNamesElement = this.generateDayNameElement();
			main.appendChild(dayNamesElement);

			var monthDaysElement = this.generateMonthDaysElement();
			main.appendChild(monthDaysElement);

			if (this.timeEnabled) {
				this.timeElement = this.generateTimeElement();
				main.appendChild(this.timeElement);
				main.appendChild(this.generateClearDiv());
			}

			return main;
		}
	}, {
		key: 'generateClearDiv',
		value: function generateClearDiv() {
			var div = this.create("div", {
				class: "clearBoth"
			});
			return div;
		}
	}, {
		key: 'getSingleDateString',
		value: function getSingleDateString(date) {
			var str = "";
			str = str + date.getDate() + " " + this.monthNames[date.getMonth()] + " " + date.getFullYear();
			return str;
		}
	}, {
		key: 'getSingleTimeString',
		value: function getSingleTimeString(timeObj) {
			var str = "";
			str = str + "(";
			str = str + this.getDoubleDigitStr(timeObj.hour) + " : " + this.getDoubleDigitStr(timeObj.minute);
			str = str + ")";
			return str;
		}
	}, {
		key: 'generateInfoElement',
		value: function generateInfoElement() {
			var _this = this;
			var li = void 0;

			var dateObj = {};
			if (this.firstDate) {
				dateObj.firstDate = this.firstDate;
			}
			if (this.secondDate) {
				dateObj.secondDate = this.secondDate;
				dateObj = this.sortDates(dateObj);
			}

			function getFirstDateString() {
				if (dateObj.firstDate) {
					return _this.getSingleDateString(dateObj.firstDate);
				}
				return "";
			}

			function getSecondDateString() {
				if (dateObj.secondDate) {
					return _this.getSingleDateString(dateObj.secondDate);
				}
				return "";
			}

			function getFirstDateTimeString() {
				if (_this.firstTime) {
					return _this.getSingleTimeString(_this.firstTime);
				}
				return "";
			}

			function getSecondDateTimeString() {
				if (_this.secondTime) {
					return _this.getSingleTimeString(_this.secondTime);
				}
				return "";
			}

			var infoElement = this.create("div", {
				class: "info"
			});
			infoElement.addEventListener("click", _this.toggleCalender.bind(_this));

			if (dateObj.firstDate) {
				var infoDateUl = this.create("ul", {
					class: "infoDate"
				});

				li = this.create("li", {}, getFirstDateString());
				infoDateUl.appendChild(li);

				if (dateObj.secondDate) {
					li = this.create("li", {}, "-");
					infoDateUl.appendChild(li);
					li = this.create("li", {}, getSecondDateString());
					infoDateUl.appendChild(li);
				}
				infoElement.appendChild(infoDateUl);
			} else {
				infoElement.innerHTML = this.infoLabel || "Pick Date";
				return infoElement;
			}

			if (this.timeEnabled) {
				var infoTimeUl = this.create("ul", {
					class: "infoTime"
				});

				li = this.create("li", {}, getFirstDateTimeString());
				infoTimeUl.appendChild(li);

				if (this.is_range && this.secondDate) {
					li = this.create("li", {}, getSecondDateTimeString());
					infoTimeUl.appendChild(li);
				}

				infoElement.appendChild(infoTimeUl);
			}

			return infoElement;
		}
	}, {
		key: 'generateSubmitElement',
		value: function generateSubmitElement() {
			var _this = this;
			var submitElement = this.create("div", {
				class: "submit"
			});
			var trigger = this.create("input", {
				value: this.submitButton,
				type: "button"
			});
			trigger.addEventListener("click", _this.submit.bind(_this));
			submitElement.appendChild(trigger);
			return submitElement;
		}
	}, {
		key: 'subtractDays',
		value: function subtractDays(date, days) {
			return new Date(date.getTime() - days * 24 * 3600 * 1000);
		}
	}, {
		key: 'addDays',
		value: function addDays(date, days) {
			return new Date(date.getTime() + days * 24 * 3600 * 1000);
		}
	}, {
		key: 'getPresetDateRangeString',
		value: function getPresetDateRangeString(presetObj) {
			return presetObj.firstDate.toLocaleDateString() + " to " + presetObj.secondDate.toLocaleDateString();
		}
	}, {
		key: 'getPresetDateRange',
		value: function getPresetDateRange(period, days) {
			var today = new Date();
			var presetObj = {};
			if (period === 1) {
				presetObj.firstDate = this.subtractDays(today, days);
				presetObj.secondDate = new Date();
			} else if (period === 2) {
				presetObj.firstDate = new Date();
				presetObj.secondDate = this.addDays(today, days);
			}
			return presetObj;
		}
	}, {
		key: 'generatePresetElement',
		value: function generatePresetElement() {
			var _this = this;
			var i = void 0;
			var presetContainer = this.create("div", {
				class: "presets"
			});
			for (i = 0; i < this.presets.length; i++) {
				var ul = this.create("ul");
				var liLabel = this.create("li", {}, this.presets[i].label);
				ul.presetDateRange = this.getPresetDateRange(this.presets[i].period, this.presets[i].days);
				var liDates = this.create("li", {}, this.getPresetDateRangeString(ul.presetDateRange));
				ul.appendChild(liLabel);
				ul.appendChild(liDates);
				ul.addEventListener("click", _this.presetClicked.bind(_this, ul.presetDateRange));
				presetContainer.appendChild(ul);
			}
			return presetContainer;
		}
	}, {
		key: 'generateDayNameElement',
		value: function generateDayNameElement() {
			var ul = void 0,
			    li = void 0,
			    i = void 0;
			var days = ["Sun", "Mo", "Tu", "Wed", "Thu", "Fr", "Sat"];

			ul = this.create("ul", {
				class: "weekdays"
			});

			for (i = 0; i < 7; i++) {
				li = this.create("li", {}, days[i]);
				ul.appendChild(li);
			}

			return ul;
		}
	}, {
		key: 'generateMonthDaysElement',
		value: function generateMonthDaysElement() {
			var _this2 = this;

			var ul = void 0,
			    li = void 0,
			    i = void 0,
			    daysInMonth = void 0,
			    firstDay = void 0;
			var _this = this;

			daysInMonth = this.getDaysInMonth(this.currentMonth, this.currentYear);
			firstDay = this.getFirstDayInMonth(this.currentMonth, this.currentYear);

			ul = this.create("ul", {
				class: "days"
			});

			for (i = 0; i < firstDay; i++) {
				li = this.create("li", {});
				ul.appendChild(li);
			}

			for (i = firstDay; i < daysInMonth + firstDay; i++) {
				var date = i - firstDay + 1;
				var actualIndex = i - firstDay;
				var dateInRange = false;
				if (this.firstDate && this.secondDate) {
					dateInRange = this.isDateInRange(new Date(this.currentYear, this.currentMonth, date), this.firstDate, this.secondDate);
				}

				var activeDate = this.isDateActive(date, _this.currentMonth, _this.currentYear);

				// make element
				li = this.create("li", {}, date);
				if (dateInRange) {
					li.classList.add("inRange");
				}
				if (activeDate) {
					li.classList.add("active");
				}

				//.............

				// Add event listeners
				// inside arrow function, 'this' is preserved and is equivalent to _this.
				li.addEventListener("click", function (date, actualIndex) {
					return _this2.dateClicked.bind(_this2, li, actualIndex, date, _this2.currentMonth, _this2.currentYear);
				}(date, actualIndex));

				if (this.highlightOnHover) {
					li.addEventListener("mouseover", function (date, actualIndex) {
						return _this2.dateHovered.bind(_this2, li, actualIndex, date, _this2.currentMonth, _this2.currentYear);
					}(date, actualIndex));
				}

				//.......................

				this.currentMonthDateElements[actualIndex] = li;

				ul.appendChild(li);
			}

			return ul;
		}
	}, {
		key: 'generateActionsElement',
		value: function generateActionsElement() {
			var _this = this;
			var div = this.create("div", {
				class: "actions"
			});

			var reset = this.create("span", {
				class: "icon icon-spinner11"
			});
			reset.addEventListener("click", _this.reset.bind(_this));
			div.appendChild(reset);

			if (this.submitButton) {
				var submitButton = this.create("span", {
					class: "icon icon-checkmark"
				});
				submitButton.addEventListener("click", _this.submit.bind(_this));
				div.appendChild(submitButton);
			}

			return div;
		}
	}, {
		key: 'generateMonthYearHeader',
		value: function generateMonthYearHeader() {
			var _this3 = this;

			var _this = this;
			var dropdown = void 0,
			    dropbtn = void 0,
			    dropContent = void 0;
			var i = void 0;
			var div = this.create("div", {
				class: "month"
			});

			var preDiv = this.create("div", {
				class: "prev"
			});
			var preDivIcon = this.create("span", {
				class: "icon icon-arrow-left"
			});
			preDiv.appendChild(preDivIcon);
			preDiv.addEventListener("click", _this.showPreviousMonth.bind(_this));
			div.appendChild(preDiv);

			var centerDiv = this.create("div", {
				class: "center"
			});
			// month selector
			dropdown = this.create("div", {
				class: "dropdown"
			});
			dropbtn = this.create("button", {
				class: "dropbtn pd4"
			}, _this.monthNames[_this.currentMonth]);
			dropContent = this.create("div", {
				class: "nnb-dropdown-content"
			});
			for (i = 0; i < 12; i++) {
				var a = this.create("a", {
					href: "javascript:void(0)"
				}, _this.monthNames[i]);
				a.addEventListener("click", function (month) {
					return _this3.switchMonth.bind(_this3, month);
				}(i));
				dropContent.appendChild(a);
			}
			dropdown.appendChild(dropbtn);
			dropdown.appendChild(dropContent);
			centerDiv.appendChild(dropdown);
			//.....................

			//year selector
			dropdown = this.create("div", {
				class: "dropdown"
			});
			dropbtn = this.create("button", {
				class: "dropbtn pd4"
			}, _this.currentYear);
			dropContent = this.create("div", {
				class: "nnb-dropdown-content"
			});
			for (i = this.yearRange.pastYear; i <= this.yearRange.futureYear; i++) {
				var _a = this.create("a", {
					href: "javascript:void(0)"
				}, i);
				_a.addEventListener("click", function (year) {
					return _this3.switchYear.bind(_this3, year);
				}(i));
				dropContent.appendChild(_a);
			}
			dropdown.appendChild(dropbtn);
			dropdown.appendChild(dropContent);
			centerDiv.appendChild(dropdown);
			//.....................


			div.appendChild(centerDiv);

			var nextDiv = this.create("div", {
				class: "next"
			});
			var nextDivIcon = this.create("span", {
				class: "icon icon-arrow-right"
			});
			nextDiv.appendChild(nextDivIcon);
			nextDiv.addEventListener("click", _this.showNextMonth.bind(_this));
			div.appendChild(nextDiv);

			return div;
		}
	}, {
		key: 'getTimeString',
		value: function getTimeString(timeObj) {
			var timeString = this.getDoubleDigitStr(timeObj.hour) + " : " + this.getDoubleDigitStr(timeObj.minute);
			return timeString;
		}
	}, {
		key: 'getDoubleDigitStr',
		value: function getDoubleDigitStr(num) {
			var str = num < 10 ? "0" + num : "" + num;
			return str;
		}
	}, {
		key: 'generateShowTimeElement',
		value: function generateShowTimeElement(timeObj) {
			var div = void 0,
			    span = void 0;
			div = this.create("div");
			span = this.create("span", {
				class: "timeLabel"
			}, this.getDoubleDigitStr(timeObj.hour) + " :");
			div.appendChild(span);

			span = this.create("span", {}, this.getDoubleDigitStr(timeObj.minute));
			div.appendChild(span);

			return div;
		}
	}, {
		key: 'generateTimeLiElement',
		value: function generateTimeLiElement(timeObj) {
			var _this4 = this;

			var _this = this;
			var div = void 0,
			    span = void 0,
			    label = void 0;
			var dropdown = void 0,
			    dropbtn = void 0,
			    dropContent = void 0,
			    timeElement = void 0;
			var i = void 0;
			var li = this.create("li");

			// Show time
			timeElement = this.generateShowTimeElement(timeObj);
			li.appendChild(timeElement);
			//...................


			// Hour selector
			div = this.create("div");
			label = this.create("label", {
				class: "timeLabel"
			}, "Hour :");
			dropdown = this.create("div", {
				class: "dropdown"
			});
			dropbtn = this.create("button", {
				class: "dropbtn"
			}, this.getDoubleDigitStr(timeObj.hour));
			dropContent = this.create("div", {
				class: "nnb-dropdown-content"
			});
			for (i = 0; i < 24; i++) {
				var a = this.create("a", {
					href: "javascript:void(0)"
				}, this.getDoubleDigitStr(i));
				a.addEventListener("click", function (hour, timeObj) {
					return _this4.switchHour.bind(_this4, hour, timeObj);
				}(i, timeObj));
				dropContent.appendChild(a);
			}
			dropdown.appendChild(dropbtn);
			dropdown.appendChild(dropContent);
			div.appendChild(label);
			div.appendChild(dropdown);
			li.appendChild(div);

			// Minute selector
			div = this.create("div");
			label = this.create("label", {
				class: "timeLabel"
			}, "Minute :");
			dropdown = this.create("div", {
				class: "dropdown"
			});
			dropbtn = this.create("button", {
				class: "dropbtn"
			}, this.getDoubleDigitStr(timeObj.minute));
			dropContent = this.create("div", {
				class: "nnb-dropdown-content"
			});
			for (i = 0; i < 60; i++) {
				var _a2 = this.create("a", {
					href: "javascript:void(0)"
				}, this.getDoubleDigitStr(i));
				_a2.addEventListener("click", function (minute, timeObj) {
					return _this4.switchMinute.bind(_this4, minute, timeObj);
				}(i, timeObj));
				dropContent.appendChild(_a2);
			}
			dropdown.appendChild(dropbtn);
			dropdown.appendChild(dropContent);
			div.appendChild(label);
			div.appendChild(dropdown);
			li.appendChild(div);

			return li;
		}
	}, {
		key: 'generateTimeElement',
		value: function generateTimeElement() {
			var _this = this;
			var div = this.create("div", {
				class: "time"
			});
			var ul = void 0;
			if (this.is_range) {
				ul = this.create("ul", {
					class: "doubleTime"
				});
			} else {
				ul = this.create("ul", {
					class: "singleTime"
				});
			}

			var firstLi = this.generateTimeLiElement(this.firstTime);
			ul.appendChild(firstLi);

			if (this.is_range) {
				var secondLi = this.generateTimeLiElement(this.secondTime);
				ul.appendChild(secondLi);
			}

			div.appendChild(ul);

			return div;
		}
	}]);

	return MyDatePicker;
}();

//Note: initialize date picker in a container element like span or div, because date picker is added as a child node to it.


function initializeDatePicker(selector, config, callback) {
	var els = document.querySelectorAll(selector);
	for (var i = 0; i < els.length; i++) {
		new MyDatePicker(els[i], config, callback);
	}
}
