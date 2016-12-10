var casper = require('casper').create({
    pageSettings: {
        loadImages: false,//The script is much faster when this field is set to false
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36'
    },
    verbose: true,
    viewportSize: {width: 1920, height: 1080},
}).selectXPath;
var fs = require('fs');

casper.start().thenOpen("https://www.tripadvisor.ru/Hotel_Review-g1956128-d6158220-Reviews-or50-Citrus_Hotel-Adler_Adler_District_Sochi_Greater_Sochi_Krasnodar_Krai_Southern_Di.html", function() {
    console.log("Url loaded");
  }
);

casper.then(function(){
  this.click('span.taLnk.ulBlueLinks');
  this.echo('Clicked!');
});

casper.then(function() {
  if (this.exists('div.ui_close_x')) {
    this.click('div.ui_close_x');
    console.log('Closing the popup');
  } else {
    console.log('No popup! Yay!');
  }
});

casper.then(function() {
  if(this.exists('span.taLnk.ulBlueLinks')){
    this.click('span.taLnk.ulBlueLinks');
  }
});

casper.then(function() {
  this.waitForSelector('div.expandLink', function() {
    var listTexts = this.getElementsInfo('//*[@class="innerBubble"]/div[@class="wrap"]/div[@data-prwidget-name="common_html"]/div[@class="entry"]').map(function(obj) {
      return obj.text;
    });
    
    var vals = Object.keys(listTexts).map(function (key) {
      if (Object.keys(listTexts).indexOf(key) % 2 !== 0) {
        return listTexts[key];
      } else {
        return;
      }
    });
    console.dir(listTexts[1]);
  }, 20000);
});

casper.run();