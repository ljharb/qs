
if (require.register) {
  var qs = require('querystring');
} else {
  var qs = require('../')
    , expect = require('expect.js');
}

describe('qs.stringify', function(){
  describe('basic', function(){
    it('should stringify a basic parameter', function(){
      expect(qs.stringify({ 'foo': 'bar' })).to.eql('foo=bar'); 
    });      
    
	  it('should stringify a pair of string parameters delimited by &', function() {
	    expect(qs.stringify({'foo' : 'bar', 'bar' : 'baz'})).to.eql('foo=bar&bar=baz');
	  });
	
	  it('should stringify and excaped char', function(){
	    expect(qs.stringify({'foo' : '\"bar\"'})).to.eql('foo=%22bar%22');
	  });
	  
	  it('should stringify to empty string if a value is missing', function() {
	    expect(qs.stringify({foo:''})).to.eql('foo=');
	  });
	  
	  it('should stringify numeric values to strings', function() {
    	expect(qs.stringify({'foo' : '1', 'bar' : '2'})).to.eql('foo=1&bar=2');
  	});

	  it('should stringify that weird field', function(){
	    expect(qs.stringify({'my weird field': "q1!2\"'w$5&7/z8)?"})).to.eql('my%20weird%20field=q1!2%22\'w%245%267%2Fz8)%3F');
	  });

	  it('should strigify a key name=name', function() {
	    expect(qs.stringify({'foo=baz': 'bar'})).to.eql('foo%3Dbaz=bar'); 
	  });

	  it('should stringify a object with 2 properties', function() {
	    expect(qs.stringify({foo: 'bar', bar: 'baz'})).to.eql('foo=bar&bar=baz'); 
	  });

		it('should strigify two empty values to not undefined', function() {
		  expect(qs.stringify({ foo: 'bar', baz: '', raz: '' })).to.eql('foo=bar&baz=&raz='); 
		});
  });
  
  describe('escaping', function(){
	  it('should work with escaping html entities in the value', function(){
	     expect(qs.stringify({foo: 'foo bar'})).to.eql('foo=foo%20bar'); 
	  }); 
	  
	  it('should work with different forms of escaping html entities', function(){
	     expect(qs.stringify({
	        cht: 'p3'
	      , chd: 't:60,40'
	      , chs: '250x100'
	      , chl: 'Hello|World'
	    })).to.eql('cht=p3&chd=t%3A60%2C40&chs=250x100&chl=Hello%7CWorld'); 
	  });
	});
	
	describe('nested', function(){
    
		it('should work with a simple array with one value', function(){
		   var str = 'foo[0]=bar';
		   var obj = {'foo' : ['bar']};
		   expect(qs.stringify(obj)).to.eql(str); 
		});

		it('should work with a simple array with two values', function(){
		   var str = 'foo[0]=bar&foo[1]=quux';
		   var obj = {'foo' : ['bar', 'quux']};
		   expect(qs.stringify(obj)).to.eql(str); 
		});	  

	  it('should work with a simple array with two numeric values', function(){
	     var str = 'foo[0]=0&foo[1]=1';
	     var obj = {'foo' : ['0', '1']};
	     expect(qs.stringify(obj)).to.eql(str); 
	  });
	  
	  it('should work with a array and a object', function(){
	     var str = 'foo=bar&baz[0]=1&baz[1]=2&baz[2]=3';
	     var obj =  {'foo' : 'bar', 'baz' : ['1', '2', '3']};
	     expect(qs.stringify(obj)).to.eql(str); 
	  });	
	  
		it('should work with a array containing string values and a array containing numeric values', function(){
			var str = 'foo[0]=bar&baz[0]=1&baz[1]=2&baz[2]=3';
			var obj =  {'foo' : ['bar'], 'baz' : ['1', '2', '3']};
			expect(qs.stringify(obj)).to.eql(str); 
		});
		
		it('should work with a array containing string values and a array containing numeric values', function(){
			var str = 'foo[0]=bar&baz[0]=1&baz[1]=2&baz[2]=3';
			var obj =  {'foo' : ['bar'], 'baz' : ['1', '2', '3']};
			expect(qs.stringify(obj)).to.eql(str); 
		});
		
	  it('should work with a double nested array with string keys and a third level with a numeric key', function(){
	     var str = 'x[y][z][0]=1';
	     var obj =  {'x' : {'y' : {'z' : ['1']}}};
	     expect(qs.stringify(obj)).to.eql(str); 
	  });
	  
		it('should work with a nested array in string with string keys and a numeric value of 1', function(){
			var str = 'x[y][z]=1';
			var obj =  {'x' : {'y' : {'z' : '1'}}};
			expect(qs.stringify(obj)).to.eql(str); 
		});  
	   
	  it('should work with a nested array in string with string keys and a numeric value of 2', function(){
	    var str = 'x[y][z]=2';
	    var obj =  {'x' : {'y' : {'z' : '2'}}};
	    expect(qs.stringify(obj)).to.eql(str); 
	  });
	  
	  it('should work with array in double nesting', function(){
	     var str = 'x[y][z][0]=1&x[y][z][1]=2';
	     var obj =  {'x' : {'y' : {'z' : ['1', '2']}}};
	     expect(qs.stringify(obj)).to.eql(str); 
	  });
	  
	  it('should work with object, array, object nesting', function(){
	     var str = 'x[y][0][z]=1';
	     var obj =  {'x' : {'y' : [{'z' : '1'}]}};
	     expect(qs.stringify(obj)).to.eql(str); 
	  });
	  
		it('should work with object, array, object, array nesting', function(){
			var str = 'x[y][0][z][0]=1';
			var obj =  {'x' : {'y' : [{'z' : ['1']}]}};
			expect(qs.stringify(obj)).to.eql(str); 
		});
		
		it('should work with object, array, object, array nesting', function(){
			var str = 'x[y][0][z][0]=1';
			var obj =  {'x' : {'y' : [{'z' : ['1']}]}};
			expect(qs.stringify(obj)).to.eql(str); 
		});
		
		it('should work with object, array, object, array nesting', function(){
			var str = 'x[y][0][z][0]=1';
			var obj =  {'x' : {'y' : [{'z' : ['1']}]}};
			expect(qs.stringify(obj)).to.eql(str); 
		});
		
		it('should work for 2 objects nested with an array', function(){
			var str = 'x[y][0][z]=1&x[y][0][w]=2';
			var obj =  {'x' : {'y' : [{'z' : '1', 'w' : '2'}]}};
			expect(qs.stringify(obj)).to.eql(str); 
		});
		
		
		it('should work for object, array, object nesting', function(){
     var str = 'x[y][0][v][w]=1';
     var obj =  {'x' : {'y' : [{'v' : {'w' : '1'}}]}};
     expect(qs.stringify(obj)).to.eql(str); 
    });
	
	  it('should work for --', function(){
	     var str = 'x[y][0][z]=1&x[y][0][v][w]=2';
	     var obj =  {'x' : {'y' : [{'z' : '1', 'v' : {'w' : '2'}}]}};
	     expect(qs.stringify(obj)).to.eql(str); 
	  });
	
	  it('should work for ---', function(){
	     var str = 'x[y][0][z]=1&x[y][1][z]=2';
	     var obj =  {'x' : {'y' : [{'z' : '1'}, {'z' : '2'}]}};
	     expect(qs.stringify(obj)).to.eql(str); 
	  });
	  
	  it('should work for ----', function(){
	     var str = 'x[y][0][z]=1&x[y][0][w]=a&x[y][1][z]=2&x[y][1][w]=3';
	     var obj =  {'x' : {'y' : [{'z' : '1', 'w' : 'a'}, {'z' : '2', 'w' : '3'}]}};
	     expect(qs.stringify(obj)).to.eql(str); 
	  });
	  
    it('should work for first and lastname of a user', function(){
     var str = 'user[name][first]=tj&user[name][last]=holowaychuk';
     var obj =  { user: { name: { first: 'tj', last: 'holowaychuk' }}};
     expect(qs.stringify(obj)).to.eql(str); 
    });
	});
	
	describe('errors', function(){
    it('should get a error for string', function(){
      var input =  'foo=bar';
      try {
      	qs.stringify(input);
      } catch (e) {
      	expect(e.message).to.eql('stringify expects an object');
      }
	  }); 
	  
	  it('should get a error for array', function(){
      var input =  ['foo', 'bar'];
      try {
      	qs.stringify(input);
      } catch (e) {
      	expect(e.message).to.eql('stringify expects an object');
      }
	  });
	 	
	  it('should get a error for null', function(){
      var input = null;
      try {
      	qs.stringify(input);
      } catch (e) {
      	expect(e.message).to.eql('stringify expects an object');
      }
	  });
		
	});
	
	describe('numbers', function(){
   it('should use numbers in arrays', function() {
   	var str = 'limit[0]=1&limit[1]=2&limit[2]=3';
   	var obj = { limit: [1, 2, 3] };
   	expect(qs.stringify(obj)).to.eql(str); 
   });
   
   it('should use numbers in objects', function() {
   	var str =  'limit=1';
   	var obj = { limit: 1 };
   	expect(qs.stringify(obj)).to.eql(str); 
   });
	});

	describe('others', function(){
	   it('should work with a date', function() {
				var date = new Date(0);
		   	var str =  'at=' + encodeURIComponent(date)
		   	var obj =  { at: date };
		   	expect(qs.stringify(obj)).to.eql(str); 
	   });	   
	});
});

