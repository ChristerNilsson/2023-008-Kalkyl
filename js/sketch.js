// Generated by CoffeeScript 2.5.1
var ANGLE_MODE, DISPLAY_MODE, KEY, LANGUAGE, assert, config, decode, encode, findLineNo, makeAnswer, memory, page, setup, solve,
  indexOf = [].indexOf;

KEY = '008B';

ANGLE_MODE = ['Degrees', 'Radians'];

LANGUAGE = ['Coffeescript', 'Javascript'];

DISPLAY_MODE = ['Fixed', 'Engineering'];

memory = null;

page = null;

config = {
  angleMode: 0,
  language: 1,
  displayMode: 0,
  digits: 3
};

assert = (a, b, msg = '') => {
  chai.assert.deepEqual(a, b, msg);
  return 'ok';
};

solve = (f, a, b) => {
  var i, j, len, ref, x;
  ref = range(50);
  for (j = 0, len = ref.length; j < len; j++) {
    i = ref[j];
    x = (a + b) / 2;
    if (f(x) === 0) {
      return x;
    }
    if (f(a) * f(x) < 0) {
      b = x;
    } else {
      a = x;
    }
  }
  return [a, b];
};

findLineNo = (e) => {
  var j, len, line, lines;
  lines = e.stack.split('\n');
  for (j = 0, len = lines.length; j < len; j++) {
    line = lines[j];
    if (0 <= line.indexOf('<anonymous>')) {
      return line.split(':')[1] - 1;
    }
  }
  return 0;
};

makeAnswer = function() {
  var JS, answer, answers, cs, e, j, js, k, len, len1, line, lineNo, lines, pos, post, pre, res, stack;
  answers = [];
  res = '';
  cs = '';
  js = [];
  JS = config.language === 0 ? '' : '`';
  angleMode([DEGREES, RADIANS][config.angleMode]);
  lines = memory.split("\n");
  for (j = 0, len = lines.length; j < len; j++) {
    line = lines[j];
    pos = line.lastIndexOf(config.language === 0 ? '#' : '//');
    if (pos >= 0) {
      line = line.slice(0, pos);
    }
    cs = line.trim();
    if (cs === '') {
      js.push(transpile(JS + 'answers.push("")' + JS));
    } else {
      try {
        if (cs[cs.length - 1] === '=') {
          cs += 'undefined';
        }
        js.push(transpile(JS + 'answers.push(' + cs + ")" + JS));
      } catch (error) {
        e = error;
        stack = e.stack.split('\n');
        js.push(transpile(JS + "answers.push('" + stack[0] + "')" + JS));
      }
    }
  }
  try {
    console.dir(js);
    eval(js.join("\n"));
  } catch (error) {
    e = error;
    console.dir(e.stack);
    lineNo = findLineNo(e);
    pre = (range(lineNo).map((x) => {
      return '\n';
    })).join('');
    post = (range(js.length - lineNo).map((x) => {
      return '\n';
    })).join('');
    lines = e.stack.split('\n');
    return pre + lines[0] + post;
  }
  res = "";
  for (k = 0, len1 = answers.length; k < len1; k++) {
    answer = answers[k];
    if ('function' === typeof answer) {
      res += 'function defined' + "\n";
    } else if ('object' === typeof answer) {
      res += JSON.stringify(answer) + "\n";
    } else if ('number' === typeof answer) {
      if (config.displayMode === 0) {
        res += fixed(answer, config.digits) + "\n";
      }
      if (config.displayMode === 1) {
        res += engineering(answer, config.digits) + "\n";
      }
    } else {
      res += answer + "\n";
    }
  }
  return res;
};

encode = function() {
  var s;
  s = encodeURI(memory);
  s = s.replace(/=/g, '%3D');
  s = s.replace(/\?/g, '%3F');
  s = s.replace(/#/g, '%23');
  return window.open('?content=' + s + '&config=' + encodeURI(JSON.stringify(config)));
};

decode = function() {
  var parameters;
  memory = '';
  if (indexOf.call(window.location.href, '?') >= 0) {
    parameters = getParameters();
    if (parameters.content) {
      memory = decodeURI(parameters.content);
      memory = memory.replace(/%3D/g, '=');
      memory = memory.replace(/%3F/g, '?');
      memory = memory.replace(/%23/g, '#');
    }
    if (parameters.config) {
      return config = JSON.parse(decodeURI(parameters.config));
    }
  }
};

setup = function() {
  // memory = fetchData()
  decode();
  page = new Page(0, function() {
    var answer, enter;
    this.table.innerHTML = "";
    enter = makeTextArea();
    enter.style.left = '51%';
    enter.style.width = '48%';
    //enter.style.overflow = 'hidden'
    enter.focus();
    enter.value = memory;
    answer = makeTextArea();
    answer.style.left = '0px';
    answer.setAttribute("readonly", true);
    answer.style.textAlign = 'right';
    answer.style.overflow = 'hidden';
    answer.wrap = 'off';
    answer.value = makeAnswer();
    enter.onscroll = function(e) {
      answer.scrollTop = enter.scrollTop;
      return answer.scrollLeft = enter.scrollLeft;
    };
    answer.onscroll = function(e) {
      return e.preventDefault();
    };
    this.addRow(enter, answer);
    return enter.addEventListener("keyup", function(event) {
      var ref;
      answer.scrollTop = enter.scrollTop;
      answer.scrollLeft = enter.scrollLeft;
      if (ref = event.keyCode, indexOf.call([33, 34, 35, 36, 37, 38, 39, 40], ref) < 0) {
        memory = enter.value;
        return answer.value = makeAnswer();
      }
    });
  });
  // storeData memory
  page.addAction('Clear', function() {
    memory = "";
    return storeAndGoto(memory, page);
  });
  page.addAction('Samples', function() {
    if (config.language === 0) {
      memory = `# Coffeescript
2+3

sträcka = 150
tid = 6
tid
sträcka/tid
25 == sträcka/tid 
30 == sträcka/tid

# String
a = "Volvo" 
5 == a.length
'l' == a[2]

# Math
5 == sqrt 25 

# Date
c = new Date() 
c.getFullYear()
c.getHours()

# Array
numbers = [1,2,3] 
2 == numbers[1]
numbers.push 47
4 == numbers.length
numbers 
47 == numbers.pop()
3 == numbers.length
numbers
assert [0,1,4,9,16,25,36,49,64,81], (x*x for x in range 10)

# Object
person = {fnamn:'David', enamn:'Larsson'}
'David' == person['fnamn']
'Larsson' == person.enamn

# functions (enbart one liners tillåtna!)
kvadrat = (x) -> x*x
25 == kvadrat 5

# feluppskattning vid användande av bäring och avstånd
area = (b1,b2,r1,r2) -> (r2*r2 - r1*r1) * Math.PI * (b2-b1)/360  
17.671458676442587 == area 90,91,200,205
35.12475119638588  == area 90,91,400,405
69.81317007977317  == area 90,92,195,205
139.62634015954634 == area 90,92,395,405

serial = (a,b) -> a+b
2 == serial 1,1
5 == serial 2,3

parallel = (a,b) -> a*b/(a+b)
0.5 == parallel 1,1
1.2 == parallel 2,3

fak = (x) -> if x==0 then 1 else x * fak(x-1)
3628800 == fak 10

fib = (x) -> if x<=0 then 1 else fib(x-1) + fib(x-2) 
1 == fib 0
2 == fib 1
5 == fib 3
8 == fib 4
13 == fib 5
21 == fib 6

f = (x) => 9**x - 6**x - 4**x
solve f,0,2
`; // Javascript
    } else {
      memory = `// Javascript
2+3

distance = 150
seconds = 6
seconds
distance/seconds
25 == distance/seconds
30 == distance/seconds

// String
a = "Volvo" 
5 == a.length
'l' == a[2]

// Math
5 == sqrt(25)

// Date
c = new Date() 
c.getFullYear()
c.getHours()

// Array
numbers = [1,2,3] 
2 == numbers[1]
numbers.push(47)
4 == numbers.length
numbers 
47 == numbers.pop()
3 == numbers.length
numbers
assert([0,1,4,9,16,25,36,49,64,81], range(10).map(x => x*x))

// Object
person = {fnamn:'David', enamn:'Larsson'}
'David' == person['fnamn']
'Larsson' == person.enamn

// functions (only one liners)
kvadrat = (x) => x*x
25 == kvadrat(5)

serial = (a,b) => a+b
2 == serial(1,1)
5 == serial(2,3)

parallel = (a,b) => a*b/(a+b)
0.5 == parallel(1,1)
1.2 == parallel(2,3)

fak = (x) => (x==0 ? 1 : x * fak(x-1))
3628800 == fak(10)

fib = (x) => x<=0 ? 1 : fib(x-1) + fib(x-2)
1 == fib(0)
2 == fib(1)
5 == fib(3)
8 == fib(4)
13 == fib(5)
21 == fib(6)

f = (x) => 9**x - 6**x - 4**x

solve(f,0,2)
`;
    }
    // storeAndGoto memory,page
    return encode();
  });
  page.addAction('Reference', function() {
    return window.open("https://www.w3schools.com/jsref/default.asp");
  });
  page.addAction('Hide', function() {
    return page.display();
  });
  page.addAction('URL', function() {
    return encode();
  });
  page.addAction(ANGLE_MODE[config.angleMode], function() {
    config.angleMode = 1 - config.angleMode;
    page.actions[5][0] = ANGLE_MODE[config.angleMode];
    makeAnswer();
    return storeAndGoto(memory, page);
  });
  page.addAction(LANGUAGE[config.language], function() {
    config.language = 1 - config.language;
    page.actions[6][0] = LANGUAGE[config.language];
    return storeAndGoto(memory, page);
  });
  page.addAction(DISPLAY_MODE[config.displayMode], function() {
    config.displayMode = 1 - config.displayMode;
    page.actions[7][0] = DISPLAY_MODE[config.displayMode];
    return storeAndGoto(memory, page);
  });
  page.addAction('Less', function() {
    if (config.digits > 1) {
      config.digits--;
    }
    return storeAndGoto(memory, page);
  });
  page.addAction('More', function() {
    if (config.digits < 17) {
      config.digits++;
    }
    return storeAndGoto(memory, page);
  });
  return page.display();
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2tldGNoLmpzIiwic291cmNlUm9vdCI6Ii4uIiwic291cmNlcyI6WyJjb2ZmZWVcXHNrZXRjaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUE7RUFBQTs7QUFBQSxHQUFBLEdBQU07O0FBRU4sVUFBQSxHQUFhLENBQUMsU0FBRCxFQUFXLFNBQVg7O0FBQ2IsUUFBQSxHQUFXLENBQUMsY0FBRCxFQUFnQixZQUFoQjs7QUFDWCxZQUFBLEdBQWUsQ0FBQyxPQUFELEVBQVMsYUFBVDs7QUFFZixNQUFBLEdBQVM7O0FBQ1QsSUFBQSxHQUFPOztBQUVQLE1BQUEsR0FDQztFQUFBLFNBQUEsRUFBWSxDQUFaO0VBQ0EsUUFBQSxFQUFXLENBRFg7RUFFQSxXQUFBLEVBQWMsQ0FGZDtFQUdBLE1BQUEsRUFBUztBQUhUOztBQUtELE1BQUEsR0FBUyxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssTUFBSSxFQUFULENBQUEsR0FBQTtFQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBWixDQUFzQixDQUF0QixFQUF3QixDQUF4QixFQUEwQixHQUExQjtTQUNBO0FBRlE7O0FBSVQsS0FBQSxHQUFRLENBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMLENBQUEsR0FBQTtBQUNSLE1BQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBO0FBQUM7RUFBQSxLQUFBLHFDQUFBOztJQUNDLENBQUEsR0FBSSxDQUFDLENBQUEsR0FBRSxDQUFILENBQUEsR0FBUTtJQUNaLElBQUcsQ0FBQSxDQUFFLENBQUYsQ0FBQSxLQUFRLENBQVg7QUFBa0IsYUFBTyxFQUF6Qjs7SUFDQSxJQUFHLENBQUEsQ0FB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Iiwic291cmNlc0NvbnRlbnQiOlsiS0VZID0gJzAwOEInXHJcblxyXG5BTkdMRV9NT0RFID0gWydEZWdyZWVzJywnUmFkaWFucyddXHJcbkxBTkdVQUdFID0gWydDb2ZmZWVzY3JpcHQnLCdKYXZhc2NyaXB0J11cclxuRElTUExBWV9NT0RFID0gWydGaXhlZCcsJ0VuZ2luZWVyaW5nJ11cclxuXHJcbm1lbW9yeSA9IG51bGxcclxucGFnZSA9IG51bGxcclxuXHJcbmNvbmZpZyA9XHJcblx0YW5nbGVNb2RlIDogMFxyXG5cdGxhbmd1YWdlIDogMVxyXG5cdGRpc3BsYXlNb2RlIDogMFxyXG5cdGRpZ2l0cyA6IDNcclxuXHJcbmFzc2VydCA9IChhLGIsbXNnPScnKSA9PlxyXG5cdGNoYWkuYXNzZXJ0LmRlZXBFcXVhbCBhLGIsbXNnXHJcblx0J29rJ1xyXG5cclxuc29sdmUgPSAoZixhLGIpID0+XHJcblx0Zm9yIGkgaW4gcmFuZ2UgNTBcclxuXHRcdHggPSAoYStiKSAvIDJcclxuXHRcdGlmIGYoeCkgPT0gMCB0aGVuIHJldHVybiB4XHJcblx0XHRpZiBmKGEpKmYoeCkgPCAwIHRoZW4gYiA9IHggZWxzZSBhID0geFxyXG5cdFthLGJdXHJcblxyXG5maW5kTGluZU5vID0gKGUpID0+XHJcblx0bGluZXMgPSBlLnN0YWNrLnNwbGl0ICdcXG4nXHJcblx0Zm9yIGxpbmUgaW4gbGluZXNcclxuXHRcdGlmIDAgPD0gbGluZS5pbmRleE9mICc8YW5vbnltb3VzPidcclxuXHRcdFx0cmV0dXJuIGxpbmUuc3BsaXQoJzonKVsxXSAtIDFcclxuXHQwXHJcblxyXG5tYWtlQW5zd2VyID0gLT4gXHJcblx0YW5zd2VycyA9IFtdXHJcblx0cmVzID0gJydcclxuXHRjcyA9ICcnXHJcblx0anMgPSBbXVxyXG5cdEpTID0gaWYgY29uZmlnLmxhbmd1YWdlID09IDAgdGhlbiAnJyBlbHNlICdgJyBcclxuXHJcblx0YW5nbGVNb2RlIFtERUdSRUVTLFJBRElBTlNdW2NvbmZpZy5hbmdsZU1vZGVdXHJcblxyXG5cdGxpbmVzID0gbWVtb3J5LnNwbGl0IFwiXFxuXCJcclxuXHRmb3IgbGluZSBpbiBsaW5lc1xyXG5cdFx0cG9zID0gbGluZS5sYXN0SW5kZXhPZiBpZiBjb25maWcubGFuZ3VhZ2UgPT0gMCB0aGVuICcjJyBlbHNlICcvLydcclxuXHRcdGlmIHBvcyA+PTAgdGhlbiBsaW5lID0gbGluZS5zbGljZSAwLHBvc1xyXG5cdFx0Y3MgPSBsaW5lLnRyaW0oKSBcclxuXHRcdGlmIGNzID09ICcnXHJcblx0XHRcdGpzLnB1c2ggdHJhbnNwaWxlIEpTICsgJ2Fuc3dlcnMucHVzaChcIlwiKScgICsgSlMgXHJcblx0XHRlbHNlXHJcblx0XHRcdHRyeVxyXG5cdFx0XHRcdGlmIGNzW2NzLmxlbmd0aC0xXT09Jz0nIHRoZW4gY3MgKz0gJ3VuZGVmaW5lZCdcclxuXHRcdFx0XHRqcy5wdXNoIHRyYW5zcGlsZSBKUyArICdhbnN3ZXJzLnB1c2goJyArIGNzICsgXCIpXCIgICsgSlMgXHJcblx0XHRcdGNhdGNoIGVcclxuXHRcdFx0XHRzdGFjayA9IGUuc3RhY2suc3BsaXQoJ1xcbicpXHJcblx0XHRcdFx0anMucHVzaCB0cmFuc3BpbGUgSlMgKyBcImFuc3dlcnMucHVzaCgnXCIgKyBzdGFja1swXSArIFwiJylcIiAgKyBKUyBcclxuXHJcblx0dHJ5XHJcblx0XHRjb25zb2xlLmRpciBqc1xyXG5cdFx0ZXZhbCBqcy5qb2luKFwiXFxuXCIpXHJcblx0Y2F0Y2ggZSBcclxuXHRcdGNvbnNvbGUuZGlyIGUuc3RhY2tcclxuXHRcdGxpbmVObyA9IGZpbmRMaW5lTm8gZVxyXG5cdFx0cHJlID0gKHJhbmdlKGxpbmVObykubWFwICh4KSA9PiAnXFxuJykuam9pbignJylcclxuXHRcdHBvc3QgPSAocmFuZ2UoanMubGVuZ3RoLWxpbmVObykubWFwICh4KSA9PiAnXFxuJykuam9pbignJylcclxuXHRcdGxpbmVzID0gZS5zdGFjay5zcGxpdCgnXFxuJylcclxuXHRcdHJldHVybiBwcmUgKyBsaW5lc1swXSArIHBvc3RcclxuXHJcblx0cmVzID0gXCJcIlxyXG5cdGZvciBhbnN3ZXIgaW4gYW5zd2Vyc1xyXG5cdFx0aWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgYW5zd2VyXHJcblx0XHRcdHJlcyArPSAnZnVuY3Rpb24gZGVmaW5lZCcgKyBcIlxcblwiIFxyXG5cdFx0ZWxzZSBpZiAnb2JqZWN0JyA9PSB0eXBlb2YgYW5zd2VyXHJcblx0XHRcdHJlcyArPSBKU09OLnN0cmluZ2lmeShhbnN3ZXIpICsgXCJcXG5cIiBcclxuXHRcdGVsc2UgaWYgJ251bWJlcicgPT0gdHlwZW9mIGFuc3dlclxyXG5cdFx0XHRpZiBjb25maWcuZGlzcGxheU1vZGUgPT0gMCB0aGVuIHJlcyArPSBmaXhlZChhbnN3ZXIsIGNvbmZpZy5kaWdpdHMpICsgXCJcXG5cIlxyXG5cdFx0XHRpZiBjb25maWcuZGlzcGxheU1vZGUgPT0gMSB0aGVuIHJlcyArPSBlbmdpbmVlcmluZyhhbnN3ZXIsIGNvbmZpZy5kaWdpdHMpICsgXCJcXG5cIlxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRyZXMgKz0gYW5zd2VyICsgXCJcXG5cIlxyXG5cdHJlcyBcclxuXHJcbmVuY29kZSA9IC0+XHJcblx0cyA9IGVuY29kZVVSSSBtZW1vcnlcclxuXHRzID0gcy5yZXBsYWNlIC89L2csJyUzRCdcclxuXHRzID0gcy5yZXBsYWNlIC9cXD8vZywnJTNGJ1xyXG5cdHMgPSBzLnJlcGxhY2UgLyMvZywnJTIzJ1xyXG5cdHdpbmRvdy5vcGVuICc/Y29udGVudD0nICsgcyArICcmY29uZmlnPScgKyBlbmNvZGVVUkkgSlNPTi5zdHJpbmdpZnkgY29uZmlnXHJcblxyXG5kZWNvZGUgPSAtPlxyXG5cdG1lbW9yeSA9ICcnXHJcblx0aWYgJz8nIGluIHdpbmRvdy5sb2NhdGlvbi5ocmVmXHJcblx0XHRwYXJhbWV0ZXJzID0gZ2V0UGFyYW1ldGVycygpXHJcblx0XHRpZiBwYXJhbWV0ZXJzLmNvbnRlbnRcclxuXHRcdFx0bWVtb3J5ID0gZGVjb2RlVVJJIHBhcmFtZXRlcnMuY29udGVudFxyXG5cdFx0XHRtZW1vcnkgPSBtZW1vcnkucmVwbGFjZSAvJTNEL2csJz0nXHJcblx0XHRcdG1lbW9yeSA9IG1lbW9yeS5yZXBsYWNlIC8lM0YvZywnPydcclxuXHRcdFx0bWVtb3J5ID0gbWVtb3J5LnJlcGxhY2UgLyUyMy9nLCcjJyBcclxuXHRcdGlmIHBhcmFtZXRlcnMuY29uZmlnXHJcblx0XHRcdGNvbmZpZyA9IEpTT04ucGFyc2UgZGVjb2RlVVJJIHBhcmFtZXRlcnMuY29uZmlnXHJcblxyXG5zZXR1cCA9IC0+XHJcblxyXG5cdCMgbWVtb3J5ID0gZmV0Y2hEYXRhKClcclxuXHRkZWNvZGUoKVxyXG5cclxuXHRwYWdlID0gbmV3IFBhZ2UgMCwgLT5cclxuXHRcdEB0YWJsZS5pbm5lckhUTUwgPSBcIlwiIFxyXG5cclxuXHRcdGVudGVyID0gbWFrZVRleHRBcmVhKClcclxuXHRcdGVudGVyLnN0eWxlLmxlZnQgPSAnNTElJ1xyXG5cdFx0ZW50ZXIuc3R5bGUud2lkdGggPSAnNDglJ1xyXG5cdFx0I2VudGVyLnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbidcclxuXHJcblx0XHRlbnRlci5mb2N1cygpXHJcblx0XHRlbnRlci52YWx1ZSA9IG1lbW9yeVxyXG5cclxuXHRcdGFuc3dlciA9IG1ha2VUZXh0QXJlYSgpIFxyXG5cdFx0YW5zd2VyLnN0eWxlLmxlZnQgPSAnMHB4J1xyXG5cdFx0YW5zd2VyLnNldEF0dHJpYnV0ZSBcInJlYWRvbmx5XCIsIHRydWVcclxuXHRcdGFuc3dlci5zdHlsZS50ZXh0QWxpZ24gPSAncmlnaHQnXHJcblx0XHRhbnN3ZXIuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJ1xyXG5cdFx0YW5zd2VyLndyYXAgPSAnb2ZmJ1xyXG5cclxuXHRcdGFuc3dlci52YWx1ZSA9IG1ha2VBbnN3ZXIoKVxyXG5cclxuXHRcdGVudGVyLm9uc2Nyb2xsID0gKGUpIC0+XHJcblx0XHRcdGFuc3dlci5zY3JvbGxUb3AgPSBlbnRlci5zY3JvbGxUb3BcclxuXHRcdFx0YW5zd2VyLnNjcm9sbExlZnQgPSBlbnRlci5zY3JvbGxMZWZ0XHJcblx0XHRhbnN3ZXIub25zY3JvbGwgPSAoZSkgLT4gZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG5cdFx0QGFkZFJvdyBlbnRlcixhbnN3ZXJcclxuXHJcblx0XHRlbnRlci5hZGRFdmVudExpc3RlbmVyIFwia2V5dXBcIiwgKGV2ZW50KSAtPlxyXG5cdFx0XHRhbnN3ZXIuc2Nyb2xsVG9wID0gZW50ZXIuc2Nyb2xsVG9wXHJcblx0XHRcdGFuc3dlci5zY3JvbGxMZWZ0ID0gZW50ZXIuc2Nyb2xsTGVmdFxyXG5cdFx0XHRcclxuXHRcdFx0aWYgZXZlbnQua2V5Q29kZSBub3QgaW4gWzMzLi40MF1cclxuXHRcdFx0XHRtZW1vcnkgPSBlbnRlci52YWx1ZVxyXG5cdFx0XHRcdGFuc3dlci52YWx1ZSA9IG1ha2VBbnN3ZXIoKVxyXG5cdFx0XHRcdCMgc3RvcmVEYXRhIG1lbW9yeVxyXG5cclxuXHRwYWdlLmFkZEFjdGlvbiAnQ2xlYXInLCAtPiBcclxuXHRcdG1lbW9yeSA9IFwiXCJcclxuXHRcdHN0b3JlQW5kR290byBtZW1vcnkscGFnZVxyXG5cclxuXHRwYWdlLmFkZEFjdGlvbiAnU2FtcGxlcycsIC0+XHJcblx0XHRpZiBjb25maWcubGFuZ3VhZ2UgPT0gMCBcclxuXHRcdFx0bWVtb3J5ID0gXCJcIlwiXHJcbiMgQ29mZmVlc2NyaXB0XHJcbjIrM1xyXG5cclxuc3Ryw6Rja2EgPSAxNTBcclxudGlkID0gNlxyXG50aWRcclxuc3Ryw6Rja2EvdGlkXHJcbjI1ID09IHN0csOkY2thL3RpZCBcclxuMzAgPT0gc3Ryw6Rja2EvdGlkXHJcblxyXG4jIFN0cmluZ1xyXG5hID0gXCJWb2x2b1wiIFxyXG41ID09IGEubGVuZ3RoXHJcbidsJyA9PSBhWzJdXHJcblxyXG4jIE1hdGhcclxuNSA9PSBzcXJ0IDI1IFxyXG5cclxuIyBEYXRlXHJcbmMgPSBuZXcgRGF0ZSgpIFxyXG5jLmdldEZ1bGxZZWFyKClcclxuYy5nZXRIb3VycygpXHJcblxyXG4jIEFycmF5XHJcbm51bWJlcnMgPSBbMSwyLDNdIFxyXG4yID09IG51bWJlcnNbMV1cclxubnVtYmVycy5wdXNoIDQ3XHJcbjQgPT0gbnVtYmVycy5sZW5ndGhcclxubnVtYmVycyBcclxuNDcgPT0gbnVtYmVycy5wb3AoKVxyXG4zID09IG51bWJlcnMubGVuZ3RoXHJcbm51bWJlcnNcclxuYXNzZXJ0IFswLDEsNCw5LDE2LDI1LDM2LDQ5LDY0LDgxXSwgKHgqeCBmb3IgeCBpbiByYW5nZSAxMClcclxuXHJcbiMgT2JqZWN0XHJcbnBlcnNvbiA9IHtmbmFtbjonRGF2aWQnLCBlbmFtbjonTGFyc3Nvbid9XHJcbidEYXZpZCcgPT0gcGVyc29uWydmbmFtbiddXHJcbidMYXJzc29uJyA9PSBwZXJzb24uZW5hbW5cclxuXHJcbiMgZnVuY3Rpb25zIChlbmJhcnQgb25lIGxpbmVycyB0aWxsw6V0bmEhKVxyXG5rdmFkcmF0ID0gKHgpIC0+IHgqeFxyXG4yNSA9PSBrdmFkcmF0IDVcclxuXHJcbiMgZmVsdXBwc2thdHRuaW5nIHZpZCBhbnbDpG5kYW5kZSBhdiBiw6RyaW5nIG9jaCBhdnN0w6VuZFxyXG5hcmVhID0gKGIxLGIyLHIxLHIyKSAtPiAocjIqcjIgLSByMSpyMSkgKiBNYXRoLlBJICogKGIyLWIxKS8zNjAgIFxyXG4xNy42NzE0NTg2NzY0NDI1ODcgPT0gYXJlYSA5MCw5MSwyMDAsMjA1XHJcbjM1LjEyNDc1MTE5NjM4NTg4ICA9PSBhcmVhIDkwLDkxLDQwMCw0MDVcclxuNjkuODEzMTcwMDc5NzczMTcgID09IGFyZWEgOTAsOTIsMTk1LDIwNVxyXG4xMzkuNjI2MzQwMTU5NTQ2MzQgPT0gYXJlYSA5MCw5MiwzOTUsNDA1XHJcblxyXG5zZXJpYWwgPSAoYSxiKSAtPiBhK2JcclxuMiA9PSBzZXJpYWwgMSwxXHJcbjUgPT0gc2VyaWFsIDIsM1xyXG5cclxucGFyYWxsZWwgPSAoYSxiKSAtPiBhKmIvKGErYilcclxuMC41ID09IHBhcmFsbGVsIDEsMVxyXG4xLjIgPT0gcGFyYWxsZWwgMiwzXHJcblxyXG5mYWsgPSAoeCkgLT4gaWYgeD09MCB0aGVuIDEgZWxzZSB4ICogZmFrKHgtMSlcclxuMzYyODgwMCA9PSBmYWsgMTBcclxuXHJcbmZpYiA9ICh4KSAtPiBpZiB4PD0wIHRoZW4gMSBlbHNlIGZpYih4LTEpICsgZmliKHgtMikgXHJcbjEgPT0gZmliIDBcclxuMiA9PSBmaWIgMVxyXG41ID09IGZpYiAzXHJcbjggPT0gZmliIDRcclxuMTMgPT0gZmliIDVcclxuMjEgPT0gZmliIDZcclxuXHJcbmYgPSAoeCkgPT4gOSoqeCAtIDYqKnggLSA0Kip4XHJcbnNvbHZlIGYsMCwyXHJcblxyXG5cIlwiXCJcclxuXHRcdGVsc2UgIyBKYXZhc2NyaXB0XHJcblx0XHRcdG1lbW9yeSA9IFwiXCJcIiBcclxuLy8gSmF2YXNjcmlwdFxyXG4yKzNcclxuXHJcbmRpc3RhbmNlID0gMTUwXHJcbnNlY29uZHMgPSA2XHJcbnNlY29uZHNcclxuZGlzdGFuY2Uvc2Vjb25kc1xyXG4yNSA9PSBkaXN0YW5jZS9zZWNvbmRzXHJcbjMwID09IGRpc3RhbmNlL3NlY29uZHNcclxuXHJcbi8vIFN0cmluZ1xyXG5hID0gXCJWb2x2b1wiIFxyXG41ID09IGEubGVuZ3RoXHJcbidsJyA9PSBhWzJdXHJcblxyXG4vLyBNYXRoXHJcbjUgPT0gc3FydCgyNSlcclxuXHJcbi8vIERhdGVcclxuYyA9IG5ldyBEYXRlKCkgXHJcbmMuZ2V0RnVsbFllYXIoKVxyXG5jLmdldEhvdXJzKClcclxuXHJcbi8vIEFycmF5XHJcbm51bWJlcnMgPSBbMSwyLDNdIFxyXG4yID09IG51bWJlcnNbMV1cclxubnVtYmVycy5wdXNoKDQ3KVxyXG40ID09IG51bWJlcnMubGVuZ3RoXHJcbm51bWJlcnMgXHJcbjQ3ID09IG51bWJlcnMucG9wKClcclxuMyA9PSBudW1iZXJzLmxlbmd0aFxyXG5udW1iZXJzXHJcbmFzc2VydChbMCwxLDQsOSwxNiwyNSwzNiw0OSw2NCw4MV0sIHJhbmdlKDEwKS5tYXAoeCA9PiB4KngpKVxyXG5cclxuLy8gT2JqZWN0XHJcbnBlcnNvbiA9IHtmbmFtbjonRGF2aWQnLCBlbmFtbjonTGFyc3Nvbid9XHJcbidEYXZpZCcgPT0gcGVyc29uWydmbmFtbiddXHJcbidMYXJzc29uJyA9PSBwZXJzb24uZW5hbW5cclxuXHJcbi8vIGZ1bmN0aW9ucyAob25seSBvbmUgbGluZXJzKVxyXG5rdmFkcmF0ID0gKHgpID0+IHgqeFxyXG4yNSA9PSBrdmFkcmF0KDUpXHJcblxyXG5zZXJpYWwgPSAoYSxiKSA9PiBhK2JcclxuMiA9PSBzZXJpYWwoMSwxKVxyXG41ID09IHNlcmlhbCgyLDMpXHJcblxyXG5wYXJhbGxlbCA9IChhLGIpID0+IGEqYi8oYStiKVxyXG4wLjUgPT0gcGFyYWxsZWwoMSwxKVxyXG4xLjIgPT0gcGFyYWxsZWwoMiwzKVxyXG5cclxuZmFrID0gKHgpID0+ICh4PT0wID8gMSA6IHggKiBmYWsoeC0xKSlcclxuMzYyODgwMCA9PSBmYWsoMTApXHJcblxyXG5maWIgPSAoeCkgPT4geDw9MCA/IDEgOiBmaWIoeC0xKSArIGZpYih4LTIpXHJcbjEgPT0gZmliKDApXHJcbjIgPT0gZmliKDEpXHJcbjUgPT0gZmliKDMpXHJcbjggPT0gZmliKDQpXHJcbjEzID09IGZpYig1KVxyXG4yMSA9PSBmaWIoNilcclxuXHJcbmYgPSAoeCkgPT4gOSoqeCAtIDYqKnggLSA0Kip4XHJcblxyXG5zb2x2ZShmLDAsMilcclxuXHJcblwiXCJcIlxyXG5cdFx0IyBzdG9yZUFuZEdvdG8gbWVtb3J5LHBhZ2VcclxuXHRcdGVuY29kZSgpXHJcblxyXG5cdHBhZ2UuYWRkQWN0aW9uICdSZWZlcmVuY2UnLCAtPiB3aW5kb3cub3BlbiBcImh0dHBzOi8vd3d3Lnczc2Nob29scy5jb20vanNyZWYvZGVmYXVsdC5hc3BcIlxyXG5cclxuXHRwYWdlLmFkZEFjdGlvbiAnSGlkZScsIC0+IFxyXG5cdFx0cGFnZS5kaXNwbGF5KClcclxuXHJcblx0cGFnZS5hZGRBY3Rpb24gJ1VSTCcsIC0+IFxyXG5cdFx0ZW5jb2RlKClcclxuXHJcblx0cGFnZS5hZGRBY3Rpb24gQU5HTEVfTU9ERVtjb25maWcuYW5nbGVNb2RlXSwgLT4gXHJcblx0XHRjb25maWcuYW5nbGVNb2RlID0gMSAtIGNvbmZpZy5hbmdsZU1vZGVcclxuXHRcdHBhZ2UuYWN0aW9uc1s1XVswXSA9IEFOR0xFX01PREVbY29uZmlnLmFuZ2xlTW9kZV1cclxuXHRcdG1ha2VBbnN3ZXIoKVxyXG5cdFx0c3RvcmVBbmRHb3RvIG1lbW9yeSxwYWdlXHJcblxyXG5cdHBhZ2UuYWRkQWN0aW9uIExBTkdVQUdFW2NvbmZpZy5sYW5ndWFnZV0sIC0+IFxyXG5cdFx0Y29uZmlnLmxhbmd1YWdlID0gMSAtIGNvbmZpZy5sYW5ndWFnZVxyXG5cdFx0cGFnZS5hY3Rpb25zWzZdWzBdID0gTEFOR1VBR0VbY29uZmlnLmxhbmd1YWdlXVxyXG5cdFx0c3RvcmVBbmRHb3RvIG1lbW9yeSxwYWdlXHJcblxyXG5cdHBhZ2UuYWRkQWN0aW9uIERJU1BMQVlfTU9ERVtjb25maWcuZGlzcGxheU1vZGVdLCAtPlxyXG5cdFx0Y29uZmlnLmRpc3BsYXlNb2RlID0gMSAtIGNvbmZpZy5kaXNwbGF5TW9kZVxyXG5cdFx0cGFnZS5hY3Rpb25zWzddWzBdID0gRElTUExBWV9NT0RFW2NvbmZpZy5kaXNwbGF5TW9kZV1cclxuXHRcdHN0b3JlQW5kR290byBtZW1vcnkscGFnZVxyXG5cclxuXHRwYWdlLmFkZEFjdGlvbiAnTGVzcycsIC0+IFxyXG5cdFx0aWYgY29uZmlnLmRpZ2l0cz4xIHRoZW4gY29uZmlnLmRpZ2l0cy0tXHJcblx0XHRzdG9yZUFuZEdvdG8gbWVtb3J5LHBhZ2VcclxuXHJcblx0cGFnZS5hZGRBY3Rpb24gJ01vcmUnLCAtPiBcclxuXHRcdGlmIGNvbmZpZy5kaWdpdHM8MTcgdGhlbiBjb25maWcuZGlnaXRzKytcclxuXHRcdHN0b3JlQW5kR290byBtZW1vcnkscGFnZVxyXG5cclxuXHRwYWdlLmRpc3BsYXkoKVxyXG4iXX0=
//# sourceURL=c:\github\2023-008-Kalkyl\coffee\sketch.coffee