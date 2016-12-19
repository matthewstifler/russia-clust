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

//Change filename for other city
var links = require("../../data/links-by-city/review-links-moscow-part3.json");

var output = [];

//----------CODE ITSELF-----------
casper.start();

casper.then(function() {
  var currIndex = 0;
  
  casper.repeat(links.length, function() {
    casper.open(links[currIndex]).then(function() {
      
      //Expanding reviews
      this.then(function(){
        if(this.exists('span.taLnk.ulBlueLinks')){
          this.click('span.taLnk.ulBlueLinks');
          this.echo('Clicked!'); 
        }
      });
      
      this.wait(500);
      
      //Debug feedback
      this.echo(Date());
      this.echo(this.getTitle());
      
      //Actual job
      this.then(function() {
        
        //Get locations
        var locs = {};
        if (this.exists('div.review div.member_info > div.location')) {
            locs = this.getElementsInfo('div.review div.member_info > div.location').map(function(obj) {
              return obj.text;
            });
            
            //Get indices of the review elements that have location info in user's profile
          var arrFilter = this.evaluate(function() {
            var elements = document.querySelectorAll('div.review div.member_info');
            var arr = [];
          
            for (i = 0; i < elements.length; i++) {
	            arr[i] = elements[i].childNodes[1].className === "location";
            };
          
            return arr;
          }); //After this step we have a logical array that says which reviews we need
        
          //Get reviews and filter them by the arrFilter from the previous step
          var revs = this.getElementsInfo(x('//*[@class="innerBubble"]/div[@class="wrap"]/div[@data-prwidget-name="common_html"]/div[@class="entry"]')).map(function(obj) {
            return obj.text;
          }).filter(function(element, index, array){
            return arrFilter[index];
          });
        
          //Store it all in output
          output.push({"location": locs, "reviews": revs}); 
            
        } else {
          output.push({"location": null, "reviews": null});
        };
        
        this.echo(output.length + "/" + links.length);
        
      });
    });
    currIndex++;
  });
});

casper.then(function() {
  fs.write("data/output-moscow-part3.json",JSON.stringify(output));
});

casper.run();