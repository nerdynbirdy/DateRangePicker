# Date Range Picker
Date Range Picker plugin build for web apps. This plugin is written in ES6 and compiled with babel.

## Getting Started

You can bower install the plugin using command  - "bower install nnbDateRangePicker"

or you can simply download the following files and include them in your project - 
* compiledPicker.js
* picker.css
* sprite.svg

### Screenshot
![Date Picker](/screenshot.png?raw=true)

## config params

```js
config = {
    currentMonth: 9,        // Optional, takes present month by default
    currentYear: 2016,      // Optional, takes present year by default
    is_range: true,         // false by default
    defaultDate: {          // Optional - specify firstDate in case of single date, both objects should be date objects.
        firstDate: new Date(2016, 9, 10),
        secondDate: new Date(2016, 9, 13)
    },
    highlightOnHover: true, // false by default, give this to highlight dates when hovered during range select.
    timeEnabled: true,      // false by default
    label: "ship date",     // initial label on top
    submitButton: true,     // if not given, callback will trigger on date select
    yearRange: {            // optional, give the range to show in year select (1990 - 2020 by default)
        pastYear: 1990,
        futureYear: 2020
    },
    presets: [              // Presets are optional. For presets to work, is_range is mandatory
        {                   // label is optional, period value 1 is for past and 2 for future.
            label: "last month",
            days: 30,
            period: 1
        }, {
            days: 7,
            period: 2
        }
    ]
}
```


## Running the tests

Just open index.html file in browser.

### How to insert plugin.
insert a "span" element in any file and call initializeDatePicker function with css selector of span(for ex. id of span), config and callback function.

#### Your HTML code
```html
.....
..
<span id="asdf"></span>
....

```
#### JS code
```js
var conf = {
    is_range: true,         
    highlightOnHover: true,     
    yearRange: {            
        pastYear: 1990,
        futureYear: 2020
    },
    presets: [            
        {                 
            label: "last month",
            days: 30,
            period: 1
        }, {
            days: 7,
            period: 2
        }
    ]
}

function callback(data) {
  console.log(data);
}

initializeDatePicker("#asdf", conf, callback);
```

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
