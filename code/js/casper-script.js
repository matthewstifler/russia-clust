var casper = require('casper').create({
    pageSettings: {
        loadImages: false,//The script is much faster when this field is set to false
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36'
    },
    verbose: true,
    viewportSize: {width: 1920, height: 1080},
});
var fs = require('fs');
var x = require('casper').selectXPath;

casper.start().thenOpen("https://www.tripadvisor.ru/Hotel_Review-g1956128-d6158220-Reviews-or50-Citrus_Hotel-Adler_Adler_District_Sochi_Greater_Sochi_Krasnodar_Krai_Southern_Di.html", function() {
    console.log("Url loaded");
  }
);

//Expanding reviews
casper.then(function(){
  this.click('span.taLnk.ulBlueLinks');
  this.echo('Clicked!');
});

//Closing possible popup
casper.then(function() {
  if (this.exists('div.ui_close_x')) {
    this.click('div.ui_close_x');
    console.log('Closing the popup');
  } else {
    console.log('No popup! Yay!');
  }
});

//Check if the reviews have expanded and then get review texts and write them
casper.then(function() {
  this.waitForSelector('span.caret-up', function() {
    var listTexts = this.getElementsInfo(x('//*[@class="innerBubble"]/div[@class="wrap"]/div[@data-prwidget-name="common_html"]/div[@class="entry"]')).map(function(obj) {
      return obj.text;
    });
    fs.write("data/dl.json", JSON.stringify(listTexts));
    this.echo("Reviews are written!");
  }, 20000);
});

casper.run();