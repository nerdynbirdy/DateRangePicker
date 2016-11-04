class MyDatePicker {
	constructor(element, config, callback) {
		this.element = element;
		this.submitCallback = callback;

		this.clearDates();
		this.clearTimes();
		this.initializeConfigParams(config);

		// Set static properties
		this.currentMonthDateElements = [];
		this.daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		this.monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		];

		this.initializeContainer(element);

	}

	setPresetsConfig(presets) {

		function getPeriodLabel(val) {
			var periodObj = {
				1: "Past",
				2: "Next"
			}
			return periodObj[val];
		}

		let i;
		this.presets = [];
		let label, days;
		for (i = 0; i < presets.length; i++) {
			if (!presets[i].days || typeof presets[i].days !== "number") {
				continue;
			}
			if (!presets[i].period || (presets[i].period !== 1 && presets[i].period !== 2)) {
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

	initializeConfigParams(config) {
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
			}
		}
		if(config.defaultDate){
			this.firstDate = config.defaultDate.firstDate;
			this.firstTime = {
				hour: this.firstDate.getHours(),
				minute: this.firstDate.getMinutes()
			}
			if(config.is_range){
				this.secondDate = config.defaultDate.secondDate;
				this.secondTime = {
					hour: this.secondDate.getHours(),
					minute: this.secondDate.getMinutes()
				}	
			}
		}
		
		if (config.is_range && config.presets) {
			this.setPresetsConfig(config.presets);
		}

	}

	getDaysInMonth(month, year) {
		if ((month == 1) && (year % 4 == 0) && ((year % 100 != 0) || (year % 400 == 0))) {
			return 29;
		} else {
			return this.daysInMonths[month];
		}
	}

	getFirstDayInMonth(month, year) {
		return new Date(year, month, 1).getDay();
	}

	create(name, attributes = {}, text) {
		let temp = document.createElement(name);

		// !!!!!!!!!! do this using Symbol.iterator
		Object.keys(attributes).forEach(function(key) {
			temp.setAttribute(key, attributes[key]);
		});
		// .............

		if (text) {
			let textNode = document.createTextNode(text);
			temp.appendChild(textNode);
		}
		return temp;
	}

	sortDates(obj) {
		if (obj.firstDate.getTime() > obj.secondDate.getTime()) {
			let tempDate = obj.firstDate;
			obj.firstDate = obj.secondDate;
			obj.secondDate = tempDate;
		}

		return obj;
	}

	getFullDate(dateObj, timeObj) {
		let date = new Date(dateObj);
		date.setHours(timeObj.hour, timeObj.minute);
		return date;
	}

	submit() {
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

	reset(){
		this.clearDates();
		this.clearTimes();
		this.refreshCalender();
	}

	showPreviousMonth() {
		this.currentMonth--;
		if (this.currentMonth < 0) {
			this.currentMonth = 11;
			this.currentYear--;
		}
		this.refreshCalender();
	}

	showNextMonth() {
		this.currentMonth++;
		if (this.currentMonth > 11) {
			this.currentMonth = 0;
			this.currentYear++;
		}
		this.refreshCalender();
	}

	switchMonth(value) {
		this.currentMonth = value;
		this.refreshCalender();
	}

	switchYear(value) {
		this.currentYear = value;
		this.refreshCalender();
	}

	switchHour(hour, timeObj, event) {
		event.preventDefault();
		timeObj.hour = hour;
		this.refreshTime();
	}

	switchMinute(minute, timeObj, event) {
		timeObj.minute = minute
		this.refreshTime();
	}

	isDateInRange(tempDate, firstDate, secondDate) {
		if (tempDate.getTime() > firstDate.getTime() && tempDate.getTime() < secondDate.getTime()) {
			return true;
		} else if (tempDate.getTime() < firstDate.getTime() && tempDate.getTime() > secondDate.getTime()) {
			return true;
		}

		return false;
	}

	isDateActive(date, month, year) {
		if (this.firstDate && this.firstDate.getDate() == date && this.firstDate.getMonth() == month && this.firstDate.getFullYear() == year) {
			return true;
		} else if (this.secondDate && this.secondDate.getDate() == date && this.secondDate.getMonth() == month && this.secondDate.getFullYear() == year) {
			return true;
		}

		return false;
	}

	makeElementActive(element) {
		if (element && element.classList) {
			element.classList.add("active");
		}
	}

	clearDates() {
		this.firstDate = null;
		this.secondDate = null;
		this.firstDateElementIndex = null;
		this.secondDateElementIndex = null;
		this.rangeInProgress = false;

	}

	clearTimes() {
		this.firstTime = {
			hour: 0,
			minute: 0
		};
		this.secondTime = {
			hour: 0,
			minute: 0
		};
	}

	presetClicked(presetObj, event) {
		this.firstDate = presetObj.firstDate;
		this.secondDate = presetObj.secondDate;
		this.refreshInfo();
		this.submit();
	}

	dateClicked(element, actualIndex, day, month, year) {

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

	dateHovered(element, actualIndex, day, month, year) {
		if (!this.rangeInProgress) {
			return;
		}

		this.setIntraElementsColor(actualIndex, new Date(year, month, day));
	}

	setIntraElementsColor(actualIndex, tempDate) {
		let i;
		let start, end;

		function dateHoveredInOtherMonth(firstDate, tempDate){
			if(tempDate.getFullYear() > firstDate.getFullYear() || (tempDate.getMonth() > firstDate.getMonth() && tempDate.getFullYear() == firstDate.getFullYear())){
				return 2; // Future month
			}
			else if(tempDate.getFullYear() < firstDate.getFullYear() || (tempDate.getMonth() < firstDate.getMonth() && tempDate.getFullYear() == firstDate.getFullYear())){
				return 1; // Past Month
			}
			else{
				return 0;
			}
		}

		switch(dateHoveredInOtherMonth(this.firstDate, tempDate)){
			case 2:
				start = 0;
				end = actualIndex;
				break;
			case 1:
				start = actualIndex;
				end = this.currentMonthDateElements.length;
				break;
			case 0:
				if(this.firstDateElementIndex < actualIndex){
					start = this.firstDateElementIndex;
					end = actualIndex;
				}
				else{
					start = actualIndex;
					end = this.firstDateElementIndex;
				}
				break;
		}

		for(i=0;i<this.currentMonthDateElements.length;i++){
			if((i >= start && i <= end)){
				this.addClass(this.currentMonthDateElements[i], "inRange");
			}
			else{
				this.removeClass(this.currentMonthDateElements[i], "inRange");
			}
		}
	}

	emptyContainer(container) {
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
	}

	addClass(element, className){
		element.classList.add(className);
	}

	removeClass(element, className){
		element.classList.remove(className);
	}

	showCalender() {
		this.removeClass(this.mainElement, "hidden");
	}

	hideCalender() {
		this.addClass(this.mainElement, "hidden");
	}

	toggleCalender() {
		this.mainElement.classList.toggle("hidden");
	}

	refreshInfo() {
		let newInfo = this.generateInfoElement();
		this.container.replaceChild(newInfo, this.infoElement);
		this.infoElement = newInfo;
	}

	refreshTime() {
		// this.generateShowTimeElement(timeObj);
		let newTimeElement = this.generateTimeElement();
		this.mainElement.replaceChild(newTimeElement, this.timeElement);
		this.timeElement = newTimeElement;
		this.refreshInfo();
	}

	refreshCalender() {
		let calender = this.generateCalender();
		this.container.replaceChild(calender, this.mainElement);
		this.mainElement = calender;

		this.refreshInfo();
	}

	initializeContainer(element) {
		let _this = this;
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

		document.addEventListener("click", function(event){
			_this.hideCalender();
		});

		this.container.addEventListener("click", function(event){
			event.stopPropagation();
		});

		
	}

	generateCalender() {

		this.currentMonthDateElements = [];

		let main = this.create("div", {
			class: "main"
		});

		if (this.presets && this.presets.length) {
			let presetElement = this.generatePresetElement();
			main.appendChild(presetElement);
		}

		let actionsElement = this.generateActionsElement();
		main.appendChild(actionsElement);

		let monthYearHeader = this.generateMonthYearHeader();
		main.appendChild(monthYearHeader);

		let dayNamesElement = this.generateDayNameElement();
		main.appendChild(dayNamesElement);

		let monthDaysElement = this.generateMonthDaysElement();
		main.appendChild(monthDaysElement);

		if (this.timeEnabled) {
			this.timeElement = this.generateTimeElement();
			main.appendChild(this.timeElement);
			main.appendChild(this.generateClearDiv());
		}

		return main;
	}

	generateClearDiv(){
		let div = this.create("div", {
			class: "clearBoth"
		});
		return div;
	}

	getSingleDateString(date) {
		let str = "";
		str = str + date.getDate() + " " + this.monthNames[date.getMonth()] + " " + date.getFullYear();
		return str;
	}

	getSingleTimeString(timeObj){
		let str = "";
		str = str + "(";
		str = str + this.getDoubleDigitStr(timeObj.hour) + " : " + this.getDoubleDigitStr(timeObj.minute);
		str = str + ")";
		return str;
	}

	generateInfoElement() {
		let _this = this;
		let li;
		
		let dateObj = {};
		if(this.firstDate){
			dateObj.firstDate = this.firstDate;
		}
		if(this.secondDate){
			dateObj.secondDate = this.secondDate;
			dateObj = this.sortDates(dateObj);
		}

		function getFirstDateString(){
			if(dateObj.firstDate){
				return _this.getSingleDateString(dateObj.firstDate);
			}
			return "";
		}

		function getSecondDateString(){
			if(dateObj.secondDate){
				return _this.getSingleDateString(dateObj.secondDate);
			}
			return "";
		}

		function getFirstDateTimeString(){
			if(_this.firstTime){
				return _this.getSingleTimeString(_this.firstTime);
			}
			return "";
		}

		function getSecondDateTimeString(){
			if(_this.secondTime){
				return _this.getSingleTimeString(_this.secondTime);
			}
			return "";
		}

		let infoElement = this.create("div", {
			class: "info"
		});
		infoElement.addEventListener("click", _this.toggleCalender.bind(_this));



		if(dateObj.firstDate){
			let infoDateUl = this.create("ul", {
				class: "infoDate"
			});

			li = this.create("li", {}, getFirstDateString());
			infoDateUl.appendChild(li);

			if(dateObj.secondDate){
				li = this.create("li", {}, "-");
				infoDateUl.appendChild(li);
				li = this.create("li", {}, getSecondDateString());
				infoDateUl.appendChild(li);
			}
			infoElement.appendChild(infoDateUl);
		}
		else{
			infoElement.innerHTML = this.infoLabel || "Pick Date"
			return infoElement;
		}
		

		if(this.timeEnabled){
			let infoTimeUl = this.create("ul", {
				class: "infoTime"
			});
			
			li = this.create("li", {}, getFirstDateTimeString());
			infoTimeUl.appendChild(li);

			if(this.is_range && this.secondDate){
				li = this.create("li", {}, getSecondDateTimeString());
				infoTimeUl.appendChild(li);	
			}

			infoElement.appendChild(infoTimeUl);
		}

		return infoElement;
	}

	generateSubmitElement() {
		let _this = this;
		let submitElement = this.create("div", {
			class: "submit"
		});
		let trigger = this.create("input", {
			value: this.submitButton,
			type: "button"
		});
		trigger.addEventListener("click", _this.submit.bind(_this));
		submitElement.appendChild(trigger);
		return submitElement;
	}

	subtractDays(date, days) {
		return new Date(date.getTime() - days * 24 * 3600 * 1000);
	}

	addDays(date, days) {
		return new Date(date.getTime() + days * 24 * 3600 * 1000);
	}

	getPresetDateRangeString(presetObj) {
		return presetObj.firstDate.toLocaleDateString() + " to " + presetObj.secondDate.toLocaleDateString();
	}

	getPresetDateRange(period, days) {
		let today = new Date();
		let presetObj = {};
		if (period === 1) {
			presetObj.firstDate = this.subtractDays(today, days);
			presetObj.secondDate = new Date();
		} else if (period === 2) {
			presetObj.firstDate = new Date();
			presetObj.secondDate = this.addDays(today, days);
		}
		return presetObj;
	}

	generatePresetElement() {
		let _this = this;
		let i;
		let presetContainer = this.create("div", {
			class: "presets"
		});
		for (i = 0; i < this.presets.length; i++) {
			let ul = this.create("ul");
			let liLabel = this.create("li", {}, this.presets[i].label);
			ul.presetDateRange = this.getPresetDateRange(this.presets[i].period, this.presets[i].days);
			let liDates = this.create("li", {}, this.getPresetDateRangeString(ul.presetDateRange));
			ul.appendChild(liLabel);
			ul.appendChild(liDates);
			ul.addEventListener("click", _this.presetClicked.bind(_this, ul.presetDateRange));
			presetContainer.appendChild(ul);
		}
		return presetContainer;
	}

	generateDayNameElement() {
		let ul, li, i;
		let days = ["Sun", "Mo", "Tu", "Wed", "Thu", "Fr", "Sat"];

		ul = this.create("ul", {
			class: "weekdays"
		});

		for (i = 0; i < 7; i++) {
			li = this.create("li", {}, days[i]);
			ul.appendChild(li);
		}

		return ul;
	}

	generateMonthDaysElement() {
		let ul, li, i, daysInMonth, firstDay;
		let _this = this;

		daysInMonth = this.getDaysInMonth(this.currentMonth, this.currentYear);
		firstDay = this.getFirstDayInMonth(this.currentMonth, this.currentYear);

		ul = this.create("ul", {
			class: "days"
		});

		for (i = 0; i < firstDay; i++) {
			li = this.create("li", {});
			ul.appendChild(li);
		}

		for (i = firstDay; i < (daysInMonth + firstDay); i++) {
			let date = i - firstDay + 1;
			let actualIndex = i - firstDay;
			let dateInRange = false;
			if(this.firstDate && this.secondDate){
				dateInRange = this.isDateInRange(new Date(this.currentYear, this.currentMonth, date), this.firstDate, this.secondDate);
			}
			
			let activeDate = this.isDateActive(date, _this.currentMonth, _this.currentYear);

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
			li.addEventListener("click", ((date, actualIndex) => {
				return this.dateClicked.bind(this, li, actualIndex, date, this.currentMonth, this.currentYear);
			})(date, actualIndex));

			if(this.highlightOnHover){
				li.addEventListener("mouseover", ((date, actualIndex) => {
					return this.dateHovered.bind(this, li, actualIndex, date, this.currentMonth, this.currentYear);
				})(date, actualIndex));
			}
			
			//.......................

			this.currentMonthDateElements[actualIndex] = li;

			ul.appendChild(li);
		}

		return ul;
	}

	generateActionsElement(){
		let _this = this;
		let div = this.create("div", {
			class: "actions"
		});

		let reset = this.create("span", {
			class: "icon icon-spinner11"
		});
		reset.addEventListener("click", _this.reset.bind(_this));
		div.appendChild(reset);

		if(this.submitButton){
			let submitButton = this.create("span", {
				class: "icon icon-checkmark"
			});
			submitButton.addEventListener("click", _this.submit.bind(_this));
			div.appendChild(submitButton);
		}

		return div;
	}

	generateMonthYearHeader() {
		let _this = this;
		let dropdown, dropbtn, dropContent;
		let i;
		let div = this.create("div", {
			class: "month"
		});
		
		let preDiv = this.create("div", {
			class: "prev"
		});
		let preDivIcon = this.create("span", {
			class: "icon icon-arrow-left"
		});
		preDiv.appendChild(preDivIcon);
		preDiv.addEventListener("click", _this.showPreviousMonth.bind(_this));
		div.appendChild(preDiv);


		let centerDiv = this.create("div", {
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
		for(i=0;i<12;i++){
			let a = this.create("a", {
				href: "javascript:void(0)"
			}, _this.monthNames[i]);
			a.addEventListener("click", ((month) => {
				return this.switchMonth.bind(this, month);
			})(i));
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
		for(i = this.yearRange.pastYear; i <= this.yearRange.futureYear; i++){
			let a = this.create("a", {
				href: "javascript:void(0)"
			}, i);
			a.addEventListener("click", ((year) => {
				return this.switchYear.bind(this, year);
			})(i));
			dropContent.appendChild(a);
		}
		dropdown.appendChild(dropbtn);
		dropdown.appendChild(dropContent);
		centerDiv.appendChild(dropdown);
		//.....................


		div.appendChild(centerDiv);


		let nextDiv = this.create("div", {
			class: "next"
		});
		let nextDivIcon = this.create("span", {
			class: "icon icon-arrow-right"
		});
		nextDiv.appendChild(nextDivIcon);
		nextDiv.addEventListener("click", _this.showNextMonth.bind(_this));
		div.appendChild(nextDiv);


		return div;

	}

	getTimeString(timeObj) {
		let timeString = this.getDoubleDigitStr(timeObj.hour) + " : " + this.getDoubleDigitStr(timeObj.minute);
		return timeString;
	}

	getDoubleDigitStr(num) {
		let str = num < 10 ? "0" + num : "" + num;
		return str;
	}

	generateShowTimeElement(timeObj){
		let div, span;
		div = this.create("div");
		span = this.create("span", {
			class: "timeLabel"
		}, this.getDoubleDigitStr(timeObj.hour) + " :");
		div.appendChild(span);

		span = this.create("span", {}, this.getDoubleDigitStr(timeObj.minute));
		div.appendChild(span);

		return div;
	}

	generateTimeLiElement(timeObj) {
		let _this = this;
		let div, span, label;
		let dropdown, dropbtn, dropContent, timeElement;
		let i;
		let li = this.create("li");
		
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
		for(i=0;i<24;i++){
			let a = this.create("a", {
				href: "javascript:void(0)"
			}, this.getDoubleDigitStr(i));
			a.addEventListener("click", ((hour, timeObj) => {
				return this.switchHour.bind(this, hour, timeObj);
			})(i, timeObj));
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
		for(i=0;i<60;i++){
			let a = this.create("a", {
				href: "javascript:void(0)"
			}, this.getDoubleDigitStr(i));
			a.addEventListener("click", ((minute, timeObj) => {
				return this.switchMinute.bind(this, minute, timeObj);
			})(i, timeObj));
			dropContent.appendChild(a);
		}
		dropdown.appendChild(dropbtn);
		dropdown.appendChild(dropContent);
		div.appendChild(label);
		div.appendChild(dropdown);
		li.appendChild(div);

		return li;

	}

	generateTimeElement() {
		let _this = this;
		let div = this.create("div", {
			class: "time"
		});
		let ul;
		if (this.is_range) {
			ul = this.create("ul", {
				class: "doubleTime"
			});
		} else {
			ul = this.create("ul", {
				class: "singleTime"
			})
		}

		let firstLi = this.generateTimeLiElement(this.firstTime);
		ul.appendChild(firstLi);

		if (this.is_range) {
			let secondLi = this.generateTimeLiElement(this.secondTime);
			ul.appendChild(secondLi);
		}

		div.appendChild(ul);

		return div;
	}

}

//Note: initialize date picker in a container element like span or div, because date picker is added as a child node to it.


function initializeDatePicker(selector, config, callback) {
	var els = document.querySelectorAll(selector);
	for (var i = 0; i < els.length; i++) {
		new MyDatePicker(els[i], config, callback);
	}
	
}

