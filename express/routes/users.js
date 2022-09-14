var express = require('express');
var router = express.Router();
var axios = require('axios')

/* GET users listing. */
router.get('/', function(req, res, next) {
  
  var config = {
    method: 'get',
    url: `https://libgen.li/index.php?req=the+tiger+at+midnight&columns%5B%5D=t&columns%5B%5D=a&columns%5B%5D=s&columns%5B%5D=y&columns%5B%5D=p&columns%5B%5D=i&objects%5B%5D=f&topics%5B%5D=l&topics%5B%5D=c&topics%5B%5D=f&topics%5B%5D=a&topics%5B%5D=m&topics%5B%5D=r&topics%5B%5D=s&res=25&covers=on&filesuns=all`,
  };

  axios(config)
  .then(function (response) {
    const regex = new RegExp(/(?<=file\.php\?id=)(.*)(?=">)/g);
    var ids = response.data.match(regex).toString();
    getBookData(ids);
    //console.log(ids);
  })
  .catch(function (error) {
    console.log(error);
  });


});

function getBookData(ids) {
  var config = {
    method: 'get',
    url: `https://libgen.li/json.php?object=e&ids=${ids}`,
  };

  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
}

router.get('/id', function(req, res, next) {

  

});

module.exports = router;
