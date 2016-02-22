(function() {
    'use strict';

angular
    .module('atm',['ngMaterial'])
    .controller('atmCtrl', atmController)
    .service('fakeService' , myfakeservice)
    
    function myfakeservice($q){
        // this is a fake service, 
        // it's purpose is just to facking network lag 
        this.getData = function () {
            $('#spinner').show();
            var deferred = $q.defer();
            setTimeout(function () {
                deferred.resolve();
                $('#spinner').hide();
            }, 2000);
            return deferred.promise;
        }
    }
    
    atmController.$inject = [
      '$timeout', 'fakeService'
    ];

    function atmController($timeout, fakeService) {
        var self = this;
        // function called so to abort the operation
        self.abort = abort;
        // funcion that let the user get to the previous page
        self.back = back;
        // funcion called when the card is inserted
        self.cardinserted = cardinserted;
        // function that adds numbers to pin or amount of money
        self.addnumber = addnumber;
        // this function let the user clear the pin inserted
        self.clearpin = clearpin;
        // proceed with the pin inserted
        self.pinproceed = pinproceed;
        // sets the amount of money the user wants
        self.setamount = setamount;
        // clear the amount of money;
        self.clearamount = clearamount;
        // the user is ok with the amount of money and proceed;
        self.amountok = amountok;
        // the user get back its card
        self.getcard = getcard;
        // the user get back its money
        self.getmoney = getmoney;
        
        init();
        
        function init(){
            // this is a Single Page Application, 
            // the navigation let the user navigate into "pages",
            // configs of those pages are contained in an array of objects.
            self.pages = [
                {
                    "id" : "welcome",
                    "name" : "welcome",
                    "description" : "insert card"
                },
                {
                    "id" : "enterpin",
                    "name" : "machine is ready",
                    "description" : "enter pin"
                },
                {
                    "id" : "pinerror",
                    "name" : "pin error",
                    "description" : "enter a correct pin"
                },
                {
                    "id" : "selectamount",
                    "name" : "ready",
                    "description" : "please select or enter an amount"
                },
                {
                    "id" : "getcardsuccess",
                    "name" : "get your card",
                    "description" : "please get back your card"
                },
                {
                    "id" : "getmoney",
                    "name" : "get your money",
                    "description" : "please get your money"
                },
                {
                    "id" : "getcardaborted",
                    "name" : "operation aborted",
                    "description" : "please get back your card in 30 seconds"
                },
                {
                    "id" : "thankyou",
                    "name" : "thank you",
                    "description" : "for using our services"
                }
            ]    
            enterpin();
        }
        
        function enterpin(){
            self.cardisinserted = false;
            self.running = false;
            self.enablepin = false;
            self.aborted = false;
            self.enablethankyou = false;
            self.enableproceedpin = false;
            self.page = self.pages[0]; // begin
        }
        
        function cardinserted(){
            fakeService.getData()
            .then(
            function () {
                console.log("card inserted")
                self.cardisinserted = true;
                self.page = self.pages[1];
                self.pin = "";
                self.maskpin = "";
                self.running = true;
                self.enablepin = true;
                self.pinmessage = "";
            })
        }
        
        function addnumber(n){
            if(self.enablepin){
                if(self.pin.length < 4){
                    self.mockpin = "1234";
                    self.pin = self.pin + n.toString();
                    self.maskpin = self.maskpin + "*";
                    if(self.pin.length == 4){
                        self.enableproceedpin = true;
                    }
                }
            } else if(self.enableamount && self.enablecustomamount){
                self.amount = self.amount + n.toString();
            }
        }
        
        function pinproceed() {
            fakeService.getData()
                .then(
                    function () {
                        if (self.pin === self.mockpin) {
                            self.amount = "";
                            self.page = self.pages[3]; // selectamount
                            self.enablepin = false;
                            self.enableamount = true;
                        } else {
                            self.pinmessage = "WRONG PIN, please enter a valid pin";
                            self.pin = "";
                            self.maskpin = "";
                            self.enableproceedpin = false;
                        }
                    })
        }
        
        function clearpin(){
            self.pin = "";
            self.maskpin = "";
            self.amount = "";
            self.enableproceedpin = false;
        }
        
        function clearamount(){
            self.amount = "";
        }
        
        function setamount(amount){
            if(amount){
                self.enablecustomamount = false;
                self.amount = amount;
            } else {
                // enable the insert of a custom amount
                self.amount = "";
                self.enablecustomamount = true;
            }
        }
        
        function amountok(){
            fakeService.getData()
            .then(
            function () {
                self.enablepin = false;
                self.enableamount = false;
                self.enablecustomamount = false;
                self.enablegetcard = true;
                self.page = self.pages[4]; // get you card
            })
        }
        
        
        function getcard(proceed){
            fakeService.getData()
            .then(
                function () {
                self.enablegetcard = false;
                if(proceed){
                    self.enablegetmoney = true;
                    self.page = self.pages[5]; // get you card
                } else {
                    self.aborted = false;
                    self.enablethankyou = true;
                    self.page = self.pages[7]; // get you card
                    $timeout(function(){
                         enterpin();
                    }, 3000);   
                }
                self.cardisinserted = false;
            })
        }
        
        function getmoney(){
            fakeService.getData()
            .then(
            function () {
            self.enablegetmoney = false;
            self.enablethankyou = true;
            self.page = self.pages[7]; // get you card
            $timeout(function(){
                enterpin();
            }, 3000);
            })
        }
        
        
        function abort(){
            fakeService.getData()
            .then(
            function () {
            self.running = false;
            self.aborted = true;
            self.enablepin = false;
            self.enableamount = false;
            self.enablecustomamount = false;
            self.enablegetcard = false;
            self.enablegetmoney = false;
            if(self.cardisinserted){
                self.page = self.pages[6]; // operation abort
    //            enterpin();
            } else {
                self.aborted = false;
                self.enablethankyou = true;
                self.page = self.pages[7]; // get you card
                $timeout(function(){
                     enterpin();
                }, 3000);  
            }
            })
        }

        
        function back() {
            switch (self.page.id) {
            case "enterpin":
                abort();
                break;
            case "selectamount":
                // no sense backing in entering pin after pin success   
                abort();
                break;
            case "getcardsuccess":
                // we go back allowing to re-insert the money amount   
                self.enablegetcard = false;
                self.amount = "";
                self.page = self.pages[3]; // selectamount
                self.enablepin = false;
                self.enableamount = true;
                break;
            case "getmoney":
                // once the card has been retired the only back possible is to abort the operation   
                abort();
                break;
            }
            
        }
        

  
    }
})();     
    
