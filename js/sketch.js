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

solve = (f, a, b, n = 20) => {
  var i, j, len, ref, x;
  ref = range(n);
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
solve f,0,2,50
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

solve(f,0,2,50)
`;
    }
    // storeAndGoto memory,page
    return encode();
  });
  page.addAction('Help', function() {
    return window.open("https://github.com/ChristerNilsson/2023-008-Kalkyl#008-kalkyl");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2tldGNoLmpzIiwic291cmNlUm9vdCI6Ii4uIiwic291cmNlcyI6WyJjb2ZmZWVcXHNrZXRjaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUE7RUFBQTs7QUFBQSxHQUFBLEdBQU07O0FBRU4sVUFBQSxHQUFhLENBQUMsU0FBRCxFQUFXLFNBQVg7O0FBQ2IsUUFBQSxHQUFXLENBQUMsY0FBRCxFQUFnQixZQUFoQjs7QUFDWCxZQUFBLEdBQWUsQ0FBQyxPQUFELEVBQVMsYUFBVDs7QUFFZixNQUFBLEdBQVM7O0FBQ1QsSUFBQSxHQUFPOztBQUVQLE1BQUEsR0FDQztFQUFBLFNBQUEsRUFBWSxDQUFaO0VBQ0EsUUFBQSxFQUFXLENBRFg7RUFFQSxXQUFBLEVBQWMsQ0FGZDtFQUdBLE1BQUEsRUFBUztBQUhUOztBQUtELE1BQUEsR0FBUyxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssTUFBSSxFQUFULENBQUEsR0FBQTtFQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBWixDQUFzQixDQUF0QixFQUF3QixDQUF4QixFQUEwQixHQUExQjtTQUNBO0FBRlE7O0FBSVQsS0FBQSxHQUFRLENBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sSUFBRSxFQUFULENBQUEsR0FBQTtBQUNSLE1BQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBO0FBQUM7RUFBQSxLQUFBLHFDQUFBOztJQUNDLENBQUEsR0FBSSxDQUFDLENBQUEsR0FBRSxDQUFILENBQUEsR0FBUTtJQUNaLElBQUcsQ0FBQSxDQUFFLENBQUYsQ0FBQSxLQUFRLENBQVg7QUFBa0IsYUFBTyxFQUF6Qjs7SUFDQSxJQUFHLENBQUEsQ0FBRSxDQUFGLENBQUEsR0FBSyxDQUFBLENBQUUsQ0FBRixDQUFMLEdBQVksQ0FBZjtNQUFzQixDQUFBLEdBQUksRUFBMUI7S0FBQSxNQUFBO01BQWlDLENBQUEsR0FBSSxFQUFyQzs7RUFIRDtTQUlBLENBQUMsQ0FBRCxFQUFHLENBQUg7QUFMTzs7QUFPUixVQUFBLEdBQWEsQ0FBQyxDQUFELENBQUEsR0FBQTtBQUNiLE1BQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUE7RUFBQyxLQUFBLEdBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFSLENBQWMsSUFBZDtFQUNSLEtBQUEsdUNBQUE7O0lBQ0MsSUFBRyxDQUFBLElBQUssSUFBSSxDQUFDLE9BQUwsQ0FBYSxhQUFiLENBQVI7QUFDQyxhQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBWCxDQUFlLENBQUMsQ0FBRCxDQUFmLEdBQXFCLEVBRDdCOztFQUREO1NBR0E7QUFMWTs7QUFPYixVQUFBLEdBQWEsUUFBQSxDQUFBLENBQUE7QUFDYixNQUFBLEVBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUE7RUFBQyxPQUFBLEdBQVU7RUFDVixHQUFBLEdBQU07RUFDTixFQUFBLEdBQUs7RUFDTCxFQUFBLEdBQUs7RUFDTCxFQUFBLEdBQVEsTUFBTSxDQUFDLFFBQVAsS0FBbUIsQ0FBdEIsR0FBNkIsRUFBN0IsR0FBcUM7RUFFMUMsU0FBQSxDQUFVLENBQUMsT0FBRCxFQUFTLE9BQVQsQ0FBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUixDQUEzQjtFQUVBLEtBQUEsR0FBUSxNQUFNLENBQUMsS0FBUCxDQUFhLElBQWI7RUFDUixLQUFBLHVDQUFBOztJQUNDLEdBQUEsR0FBTSxJQUFJLENBQUMsV0FBTCxDQUFvQixNQUFNLENBQUMsUUFBUCxLQUFtQixDQUF0QixHQUE2QixHQUE3QixHQUFzQyxJQUF2RDtJQUNOLElBQUcsR0FBQSxJQUFNLENBQVQ7TUFBZ0IsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxFQUFhLEdBQWIsRUFBdkI7O0lBQ0EsRUFBQSxHQUFLLElBQUksQ0FBQyxJQUFMLENBQUE7SUFDTCxJQUFHLEVBQUEsS0FBTSxFQUFUO01BQ0MsRUFBRSxDQUFDLElBQUgsQ0FBUSxTQUFBLENBQVUsRUFBQSxHQUFLLGtCQUFMLEdBQTJCLEVBQXJDLENBQVIsRUFERDtLQUFBLE1BQUE7QUFHQztRQUNDLElBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFILEdBQVUsQ0FBWCxDQUFGLEtBQWlCLEdBQXBCO1VBQTZCLEVBQUEsSUFBTSxZQUFuQzs7UUFDQSxFQUFFLENBQUMsSUFBSCxDQUFRLFNBQUEsQ0FBVSxFQUFBLEdBQUssZUFBTCxHQUF1QixFQUF2QixHQUE0QixHQUE1QixHQUFtQyxFQUE3QyxDQUFSLEVBRkQ7T0FHQSxhQUFBO1FBQU07UUFDTCxLQUFBLEdBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFSLENBQWMsSUFBZDtRQUNSLEVBQUUsQ0FBQyxJQUFILENBQVEsU0FBQSxDQUFVLEVBQUEsR0FBSyxnQkFBTCxHQUF3QixLQUFLLENBQUMsQ0FBRCxDQUE3QixHQUFtQyxJQUFuQyxHQUEyQyxFQUFyRCxDQUFSLEVBRkQ7T0FORDs7RUFKRDtBQWNBO0lBQ0MsT0FBTyxDQUFDLEdBQVIsQ0FBWSxFQUFaO0lBQ0EsSUFBQSxDQUFLLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUixDQUFMLEVBRkQ7R0FHQSxhQUFBO0lBQU07SUFDTCxPQUFPLENBQUMsR0FBUixDQUFZLENBQUMsQ0FBQyxLQUFkO0lBQ0EsTUFBQSxHQUFTLFVBQUEsQ0FBVyxDQUFYO0lBQ1QsR0FBQSxHQUFNLENBQUMsS0FBQSxDQUFNLE1BQU4sQ0FBYSxDQUFDLEdBQWQsQ0FBa0IsQ0FBQyxDQUFELENBQUEsR0FBQTthQUFPO0lBQVAsQ0FBbEIsQ0FBRCxDQUErQixDQUFDLElBQWhDLENBQXFDLEVBQXJDO0lBQ04sSUFBQSxHQUFPLENBQUMsS0FBQSxDQUFNLEVBQUUsQ0FBQyxNQUFILEdBQVUsTUFBaEIsQ0FBdUIsQ0FBQyxHQUF4QixDQUE0QixDQUFDLENBQUQsQ0FBQSxHQUFBO2FBQU87SUFBUCxDQUE1QixDQUFELENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsRUFBL0M7SUFDUCxLQUFBLEdBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFSLENBQWMsSUFBZDtBQUNSLFdBQU8sR0FBQSxHQUFNLEtBQUssQ0FBQyxDQUFELENBQVgsR0FBaUIsS0FOekI7O0VBUUEsR0FBQSxHQUFNO0VBQ04sS0FBQSwyQ0FBQTs7SUFDQyxJQUFHLFVBQUEsS0FBYyxPQUFPLE1BQXhCO01BQ0MsR0FBQSxJQUFPLGtCQUFBLEdBQXFCLEtBRDdCO0tBQUEsTUFFSyxJQUFHLFFBQUEsS0FBWSxPQUFPLE1BQXRCO01BQ0osR0FBQSxJQUFPLElBQUksQ0FBQyxTQUFMLENBQWUsTUFBZixDQUFBLEdBQXlCLEtBRDVCO0tBQUEsTUFFQSxJQUFHLFFBQUEsS0FBWSxPQUFPLE1BQXRCO01BQ0osSUFBRyxNQUFNLENBQUMsV0FBUCxLQUFzQixDQUF6QjtRQUFnQyxHQUFBLElBQU8sS0FBQSxDQUFNLE1BQU4sRUFBYyxNQUFNLENBQUMsTUFBckIsQ0FBQSxHQUErQixLQUF0RTs7TUFDQSxJQUFHLE1BQU0sQ0FBQyxXQUFQLEtBQXNCLENBQXpCO1FBQWdDLEdBQUEsSUFBTyxXQUFBLENBQVksTUFBWixFQUFvQixNQUFNLENBQUMsTUFBM0IsQ0FBQSxHQUFxQyxLQUE1RTtPQUZJO0tBQUEsTUFBQTtNQUlKLEdBQUEsSUFBTyxNQUFBLEdBQVMsS0FKWjs7RUFMTjtTQVVBO0FBOUNZOztBQWdEYixNQUFBLEdBQVMsUUFBQSxDQUFBLENBQUE7QUFDVCxNQUFBO0VBQUMsQ0FBQSxHQUFJLFNBQUEsQ0FBVSxNQUFWO0VBQ0osQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBVixFQUFlLEtBQWY7RUFDSixDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFWLEVBQWdCLEtBQWhCO0VBQ0osQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBVixFQUFlLEtBQWY7U0FDSixNQUFNLENBQUMsSUFBUCxDQUFZLFdBQUEsR0FBYyxDQUFkLEdBQWtCLFVBQWxCLEdBQStCLFNBQUEsQ0FBVSxJQUFJLENBQUMsU0FBTCxDQUFlLE1BQWYsQ0FBVixDQUEzQztBQUxROztBQU9ULE1BQUEsR0FBUyxRQUFBLENBQUEsQ0FBQTtBQUNULE1BQUE7RUFBQyxNQUFBLEdBQVM7RUFDVCxpQkFBVSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQXZCLFNBQUg7SUFDQyxVQUFBLEdBQWEsYUFBQSxDQUFBO0lBQ2IsSUFBRyxVQUFVLENBQUMsT0FBZDtNQUNDLE1BQUEsR0FBUyxTQUFBLENBQVUsVUFBVSxDQUFDLE9BQXJCO01BQ1QsTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUFQLENBQWUsTUFBZixFQUFzQixHQUF0QjtNQUNULE1BQUEsR0FBUyxNQUFNLENBQUMsT0FBUCxDQUFlLE1BQWYsRUFBc0IsR0FBdEI7TUFDVCxNQUFBLEdBQVMsTUFBTSxDQUFDLE9BQVAsQ0FBZSxNQUFmLEVBQXNCLEdBQXRCLEVBSlY7O0lBS0EsSUFBRyxVQUFVLENBQUMsTUFBZDthQUNDLE1BQUEsR0FBUyxJQUFJLENBQUMsS0FBTCxDQUFXLFNBQUEsQ0FBVSxVQUFVLENBQUMsTUFBckIsQ0FBWCxFQURWO0tBUEQ7O0FBRlE7O0FBWVQsS0FBQSxHQUFRLFFBQUEsQ0FBQSxDQUFBLEVBQUE7O0VBR1AsTUFBQSxDQUFBO0VBRUEsSUFBQSxHQUFPLElBQUksSUFBSixDQUFTLENBQVQsRUFBWSxRQUFBLENBQUEsQ0FBQTtBQUNwQixRQUFBLE1BQUEsRUFBQTtJQUFFLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxHQUFtQjtJQUVuQixLQUFBLEdBQVEsWUFBQSxDQUFBO0lBQ1IsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFaLEdBQW1CO0lBQ25CLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBWixHQUFvQixNQUp0Qjs7SUFPRSxLQUFLLENBQUMsS0FBTixDQUFBO0lBQ0EsS0FBSyxDQUFDLEtBQU4sR0FBYztJQUVkLE1BQUEsR0FBUyxZQUFBLENBQUE7SUFDVCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQWIsR0FBb0I7SUFDcEIsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsVUFBcEIsRUFBZ0MsSUFBaEM7SUFDQSxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQWIsR0FBeUI7SUFDekIsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFiLEdBQXdCO0lBQ3hCLE1BQU0sQ0FBQyxJQUFQLEdBQWM7SUFFZCxNQUFNLENBQUMsS0FBUCxHQUFlLFVBQUEsQ0FBQTtJQUVmLEtBQUssQ0FBQyxRQUFOLEdBQWlCLFFBQUEsQ0FBQyxDQUFELENBQUE7TUFDaEIsTUFBTSxDQUFDLFNBQVAsR0FBbUIsS0FBSyxDQUFDO2FBQ3pCLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLEtBQUssQ0FBQztJQUZWO0lBR2pCLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLFFBQUEsQ0FBQyxDQUFELENBQUE7YUFBTyxDQUFDLENBQUMsY0FBRixDQUFBO0lBQVA7SUFFbEIsSUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLEVBQWMsTUFBZDtXQUVBLEtBQUssQ0FBQyxnQkFBTixDQUF1QixPQUF2QixFQUFnQyxRQUFBLENBQUMsS0FBRCxDQUFBO0FBQ2xDLFVBQUE7TUFBRyxNQUFNLENBQUMsU0FBUCxHQUFtQixLQUFLLENBQUM7TUFDekIsTUFBTSxDQUFDLFVBQVAsR0FBb0IsS0FBSyxDQUFDO01BRTFCLFVBQUcsS0FBSyxDQUFDLHNCQUFlLGtDQUFyQixRQUFIO1FBQ0MsTUFBQSxHQUFTLEtBQUssQ0FBQztlQUNmLE1BQU0sQ0FBQyxLQUFQLEdBQWUsVUFBQSxDQUFBLEVBRmhCOztJQUorQixDQUFoQztFQTNCa0IsQ0FBWixFQUhSOztFQXVDQyxJQUFJLENBQUMsU0FBTCxDQUFlLE9BQWYsRUFBd0IsUUFBQSxDQUFBLENBQUE7SUFDdkIsTUFBQSxHQUFTO1dBQ1QsWUFBQSxDQUFhLE1BQWIsRUFBb0IsSUFBcEI7RUFGdUIsQ0FBeEI7RUFJQSxJQUFJLENBQUMsU0FBTCxDQUFlLFNBQWYsRUFBMEIsUUFBQSxDQUFBLENBQUE7SUFDekIsSUFBRyxNQUFNLENBQUMsUUFBUCxLQUFtQixDQUF0QjtNQUNDLE1BQUEsR0FBUyxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLEVBRFY7S0FBQSxNQUFBO01BNEVDLE1BQUEsR0FBUyxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLEVBNUVWO0tBQUY7O1dBaUpFLE1BQUEsQ0FBQTtFQWxKeUIsQ0FBMUI7RUFvSkEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxNQUFmLEVBQXVCLFFBQUEsQ0FBQSxDQUFBO1dBQUcsTUFBTSxDQUFDLElBQVAsQ0FBWSwrREFBWjtFQUFILENBQXZCO0VBQ0EsSUFBSSxDQUFDLFNBQUwsQ0FBZSxNQUFmLEVBQXVCLFFBQUEsQ0FBQSxDQUFBO1dBQUcsSUFBSSxDQUFDLE9BQUwsQ0FBQTtFQUFILENBQXZCO0VBQ0EsSUFBSSxDQUFDLFNBQUwsQ0FBZSxLQUFmLEVBQXNCLFFBQUEsQ0FBQSxDQUFBO1dBQUcsTUFBQSxDQUFBO0VBQUgsQ0FBdEI7RUFFQSxJQUFJLENBQUMsU0FBTCxDQUFlLFVBQVUsQ0FBQyxNQUFNLENBQUMsU0FBUixDQUF6QixFQUE2QyxRQUFBLENBQUEsQ0FBQTtJQUM1QyxNQUFNLENBQUMsU0FBUCxHQUFtQixDQUFBLEdBQUksTUFBTSxDQUFDO0lBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBRCxDQUFHLENBQUMsQ0FBRCxDQUFmLEdBQXFCLFVBQVUsQ0FBQyxNQUFNLENBQUMsU0FBUjtJQUMvQixVQUFBLENBQUE7V0FDQSxZQUFBLENBQWEsTUFBYixFQUFvQixJQUFwQjtFQUo0QyxDQUE3QztFQU1BLElBQUksQ0FBQyxTQUFMLENBQWUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFSLENBQXZCLEVBQTBDLFFBQUEsQ0FBQSxDQUFBO0lBQ3pDLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLENBQUEsR0FBSSxNQUFNLENBQUM7SUFDN0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFELENBQUcsQ0FBQyxDQUFELENBQWYsR0FBcUIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFSO1dBQzdCLFlBQUEsQ0FBYSxNQUFiLEVBQW9CLElBQXBCO0VBSHlDLENBQTFDO0VBS0EsSUFBSSxDQUFDLFNBQUwsQ0FBZSxZQUFZLENBQUMsTUFBTSxDQUFDLFdBQVIsQ0FBM0IsRUFBaUQsUUFBQSxDQUFBLENBQUE7SUFDaEQsTUFBTSxDQUFDLFdBQVAsR0FBcUIsQ0FBQSxHQUFJLE1BQU0sQ0FBQztJQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUQsQ0FBRyxDQUFDLENBQUQsQ0FBZixHQUFxQixZQUFZLENBQUMsTUFBTSxDQUFDLFdBQVI7V0FDakMsWUFBQSxDQUFhLE1BQWIsRUFBb0IsSUFBcEI7RUFIZ0QsQ0FBakQ7RUFLQSxJQUFJLENBQUMsU0FBTCxDQUFlLE1BQWYsRUFBdUIsUUFBQSxDQUFBLENBQUE7SUFDdEIsSUFBRyxNQUFNLENBQUMsTUFBUCxHQUFnQixDQUFuQjtNQUEwQixNQUFNLENBQUMsTUFBUCxHQUExQjs7V0FDQSxZQUFBLENBQWEsTUFBYixFQUFvQixJQUFwQjtFQUZzQixDQUF2QjtFQUlBLElBQUksQ0FBQyxTQUFMLENBQWUsTUFBZixFQUF1QixRQUFBLENBQUEsQ0FBQTtJQUN0QixJQUFHLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLEVBQW5CO01BQTJCLE1BQU0sQ0FBQyxNQUFQLEdBQTNCOztXQUNBLFlBQUEsQ0FBYSxNQUFiLEVBQW9CLElBQXBCO0VBRnNCLENBQXZCO1NBSUEsSUFBSSxDQUFDLE9BQUwsQ0FBQTtBQTdOTyIsInNvdXJjZXNDb250ZW50IjpbIktFWSA9ICcwMDhCJ1xyXG5cclxuQU5HTEVfTU9ERSA9IFsnRGVncmVlcycsJ1JhZGlhbnMnXVxyXG5MQU5HVUFHRSA9IFsnQ29mZmVlc2NyaXB0JywnSmF2YXNjcmlwdCddXHJcbkRJU1BMQVlfTU9ERSA9IFsnRml4ZWQnLCdFbmdpbmVlcmluZyddXHJcblxyXG5tZW1vcnkgPSBudWxsXHJcbnBhZ2UgPSBudWxsXHJcblxyXG5jb25maWcgPVxyXG5cdGFuZ2xlTW9kZSA6IDBcclxuXHRsYW5ndWFnZSA6IDFcclxuXHRkaXNwbGF5TW9kZSA6IDBcclxuXHRkaWdpdHMgOiAzXHJcblxyXG5hc3NlcnQgPSAoYSxiLG1zZz0nJykgPT5cclxuXHRjaGFpLmFzc2VydC5kZWVwRXF1YWwgYSxiLG1zZ1xyXG5cdCdvaydcclxuXHJcbnNvbHZlID0gKGYsYSxiLG49MjApID0+XHJcblx0Zm9yIGkgaW4gcmFuZ2UgblxyXG5cdFx0eCA9IChhK2IpIC8gMlxyXG5cdFx0aWYgZih4KSA9PSAwIHRoZW4gcmV0dXJuIHhcclxuXHRcdGlmIGYoYSkqZih4KSA8IDAgdGhlbiBiID0geCBlbHNlIGEgPSB4XHJcblx0W2EsYl1cclxuXHJcbmZpbmRMaW5lTm8gPSAoZSkgPT5cclxuXHRsaW5lcyA9IGUuc3RhY2suc3BsaXQgJ1xcbidcclxuXHRmb3IgbGluZSBpbiBsaW5lc1xyXG5cdFx0aWYgMCA8PSBsaW5lLmluZGV4T2YgJzxhbm9ueW1vdXM+J1xyXG5cdFx0XHRyZXR1cm4gbGluZS5zcGxpdCgnOicpWzFdIC0gMVxyXG5cdDBcclxuXHJcbm1ha2VBbnN3ZXIgPSAtPiBcclxuXHRhbnN3ZXJzID0gW11cclxuXHRyZXMgPSAnJ1xyXG5cdGNzID0gJydcclxuXHRqcyA9IFtdXHJcblx0SlMgPSBpZiBjb25maWcubGFuZ3VhZ2UgPT0gMCB0aGVuICcnIGVsc2UgJ2AnIFxyXG5cclxuXHRhbmdsZU1vZGUgW0RFR1JFRVMsUkFESUFOU11bY29uZmlnLmFuZ2xlTW9kZV1cclxuXHJcblx0bGluZXMgPSBtZW1vcnkuc3BsaXQgXCJcXG5cIlxyXG5cdGZvciBsaW5lIGluIGxpbmVzXHJcblx0XHRwb3MgPSBsaW5lLmxhc3RJbmRleE9mIGlmIGNvbmZpZy5sYW5ndWFnZSA9PSAwIHRoZW4gJyMnIGVsc2UgJy8vJ1xyXG5cdFx0aWYgcG9zID49MCB0aGVuIGxpbmUgPSBsaW5lLnNsaWNlIDAscG9zXHJcblx0XHRjcyA9IGxpbmUudHJpbSgpIFxyXG5cdFx0aWYgY3MgPT0gJydcclxuXHRcdFx0anMucHVzaCB0cmFuc3BpbGUgSlMgKyAnYW5zd2Vycy5wdXNoKFwiXCIpJyAgKyBKUyBcclxuXHRcdGVsc2VcclxuXHRcdFx0dHJ5XHJcblx0XHRcdFx0aWYgY3NbY3MubGVuZ3RoLTFdPT0nPScgdGhlbiBjcyArPSAndW5kZWZpbmVkJ1xyXG5cdFx0XHRcdGpzLnB1c2ggdHJhbnNwaWxlIEpTICsgJ2Fuc3dlcnMucHVzaCgnICsgY3MgKyBcIilcIiAgKyBKUyBcclxuXHRcdFx0Y2F0Y2ggZVxyXG5cdFx0XHRcdHN0YWNrID0gZS5zdGFjay5zcGxpdCgnXFxuJylcclxuXHRcdFx0XHRqcy5wdXNoIHRyYW5zcGlsZSBKUyArIFwiYW5zd2Vycy5wdXNoKCdcIiArIHN0YWNrWzBdICsgXCInKVwiICArIEpTIFxyXG5cclxuXHR0cnlcclxuXHRcdGNvbnNvbGUuZGlyIGpzXHJcblx0XHRldmFsIGpzLmpvaW4oXCJcXG5cIilcclxuXHRjYXRjaCBlIFxyXG5cdFx0Y29uc29sZS5kaXIgZS5zdGFja1xyXG5cdFx0bGluZU5vID0gZmluZExpbmVObyBlXHJcblx0XHRwcmUgPSAocmFuZ2UobGluZU5vKS5tYXAgKHgpID0+ICdcXG4nKS5qb2luKCcnKVxyXG5cdFx0cG9zdCA9IChyYW5nZShqcy5sZW5ndGgtbGluZU5vKS5tYXAgKHgpID0+ICdcXG4nKS5qb2luKCcnKVxyXG5cdFx0bGluZXMgPSBlLnN0YWNrLnNwbGl0KCdcXG4nKVxyXG5cdFx0cmV0dXJuIHByZSArIGxpbmVzWzBdICsgcG9zdFxyXG5cclxuXHRyZXMgPSBcIlwiXHJcblx0Zm9yIGFuc3dlciBpbiBhbnN3ZXJzXHJcblx0XHRpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBhbnN3ZXJcclxuXHRcdFx0cmVzICs9ICdmdW5jdGlvbiBkZWZpbmVkJyArIFwiXFxuXCIgXHJcblx0XHRlbHNlIGlmICdvYmplY3QnID09IHR5cGVvZiBhbnN3ZXJcclxuXHRcdFx0cmVzICs9IEpTT04uc3RyaW5naWZ5KGFuc3dlcikgKyBcIlxcblwiIFxyXG5cdFx0ZWxzZSBpZiAnbnVtYmVyJyA9PSB0eXBlb2YgYW5zd2VyXHJcblx0XHRcdGlmIGNvbmZpZy5kaXNwbGF5TW9kZSA9PSAwIHRoZW4gcmVzICs9IGZpeGVkKGFuc3dlciwgY29uZmlnLmRpZ2l0cykgKyBcIlxcblwiXHJcblx0XHRcdGlmIGNvbmZpZy5kaXNwbGF5TW9kZSA9PSAxIHRoZW4gcmVzICs9IGVuZ2luZWVyaW5nKGFuc3dlciwgY29uZmlnLmRpZ2l0cykgKyBcIlxcblwiXHJcblx0XHRlbHNlXHJcblx0XHRcdHJlcyArPSBhbnN3ZXIgKyBcIlxcblwiXHJcblx0cmVzIFxyXG5cclxuZW5jb2RlID0gLT5cclxuXHRzID0gZW5jb2RlVVJJIG1lbW9yeVxyXG5cdHMgPSBzLnJlcGxhY2UgLz0vZywnJTNEJ1xyXG5cdHMgPSBzLnJlcGxhY2UgL1xcPy9nLCclM0YnXHJcblx0cyA9IHMucmVwbGFjZSAvIy9nLCclMjMnXHJcblx0d2luZG93Lm9wZW4gJz9jb250ZW50PScgKyBzICsgJyZjb25maWc9JyArIGVuY29kZVVSSSBKU09OLnN0cmluZ2lmeSBjb25maWdcclxuXHJcbmRlY29kZSA9IC0+XHJcblx0bWVtb3J5ID0gJydcclxuXHRpZiAnPycgaW4gd2luZG93LmxvY2F0aW9uLmhyZWZcclxuXHRcdHBhcmFtZXRlcnMgPSBnZXRQYXJhbWV0ZXJzKClcclxuXHRcdGlmIHBhcmFtZXRlcnMuY29udGVudFxyXG5cdFx0XHRtZW1vcnkgPSBkZWNvZGVVUkkgcGFyYW1ldGVycy5jb250ZW50XHJcblx0XHRcdG1lbW9yeSA9IG1lbW9yeS5yZXBsYWNlIC8lM0QvZywnPSdcclxuXHRcdFx0bWVtb3J5ID0gbWVtb3J5LnJlcGxhY2UgLyUzRi9nLCc/J1xyXG5cdFx0XHRtZW1vcnkgPSBtZW1vcnkucmVwbGFjZSAvJTIzL2csJyMnIFxyXG5cdFx0aWYgcGFyYW1ldGVycy5jb25maWdcclxuXHRcdFx0Y29uZmlnID0gSlNPTi5wYXJzZSBkZWNvZGVVUkkgcGFyYW1ldGVycy5jb25maWdcclxuXHJcbnNldHVwID0gLT5cclxuXHJcblx0IyBtZW1vcnkgPSBmZXRjaERhdGEoKVxyXG5cdGRlY29kZSgpXHJcblxyXG5cdHBhZ2UgPSBuZXcgUGFnZSAwLCAtPlxyXG5cdFx0QHRhYmxlLmlubmVySFRNTCA9IFwiXCIgXHJcblxyXG5cdFx0ZW50ZXIgPSBtYWtlVGV4dEFyZWEoKVxyXG5cdFx0ZW50ZXIuc3R5bGUubGVmdCA9ICc1MSUnXHJcblx0XHRlbnRlci5zdHlsZS53aWR0aCA9ICc0OCUnXHJcblx0XHQjZW50ZXIuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJ1xyXG5cclxuXHRcdGVudGVyLmZvY3VzKClcclxuXHRcdGVudGVyLnZhbHVlID0gbWVtb3J5XHJcblxyXG5cdFx0YW5zd2VyID0gbWFrZVRleHRBcmVhKCkgXHJcblx0XHRhbnN3ZXIuc3R5bGUubGVmdCA9ICcwcHgnXHJcblx0XHRhbnN3ZXIuc2V0QXR0cmlidXRlIFwicmVhZG9ubHlcIiwgdHJ1ZVxyXG5cdFx0YW5zd2VyLnN0eWxlLnRleHRBbGlnbiA9ICdyaWdodCdcclxuXHRcdGFuc3dlci5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nXHJcblx0XHRhbnN3ZXIud3JhcCA9ICdvZmYnXHJcblxyXG5cdFx0YW5zd2VyLnZhbHVlID0gbWFrZUFuc3dlcigpXHJcblxyXG5cdFx0ZW50ZXIub25zY3JvbGwgPSAoZSkgLT5cclxuXHRcdFx0YW5zd2VyLnNjcm9sbFRvcCA9IGVudGVyLnNjcm9sbFRvcFxyXG5cdFx0XHRhbnN3ZXIuc2Nyb2xsTGVmdCA9IGVudGVyLnNjcm9sbExlZnRcclxuXHRcdGFuc3dlci5vbnNjcm9sbCA9IChlKSAtPiBlLnByZXZlbnREZWZhdWx0KClcclxuXHJcblx0XHRAYWRkUm93IGVudGVyLGFuc3dlclxyXG5cclxuXHRcdGVudGVyLmFkZEV2ZW50TGlzdGVuZXIgXCJrZXl1cFwiLCAoZXZlbnQpIC0+XHJcblx0XHRcdGFuc3dlci5zY3JvbGxUb3AgPSBlbnRlci5zY3JvbGxUb3BcclxuXHRcdFx0YW5zd2VyLnNjcm9sbExlZnQgPSBlbnRlci5zY3JvbGxMZWZ0XHJcblx0XHRcdFxyXG5cdFx0XHRpZiBldmVudC5rZXlDb2RlIG5vdCBpbiBbMzMuLjQwXVxyXG5cdFx0XHRcdG1lbW9yeSA9IGVudGVyLnZhbHVlXHJcblx0XHRcdFx0YW5zd2VyLnZhbHVlID0gbWFrZUFuc3dlcigpXHJcblx0XHRcdFx0IyBzdG9yZURhdGEgbWVtb3J5XHJcblxyXG5cdHBhZ2UuYWRkQWN0aW9uICdDbGVhcicsIC0+IFxyXG5cdFx0bWVtb3J5ID0gXCJcIlxyXG5cdFx0c3RvcmVBbmRHb3RvIG1lbW9yeSxwYWdlXHJcblxyXG5cdHBhZ2UuYWRkQWN0aW9uICdTYW1wbGVzJywgLT5cclxuXHRcdGlmIGNvbmZpZy5sYW5ndWFnZSA9PSAwIFxyXG5cdFx0XHRtZW1vcnkgPSBcIlwiXCJcclxuIyBDb2ZmZWVzY3JpcHRcclxuMiszXHJcblxyXG5zdHLDpGNrYSA9IDE1MFxyXG50aWQgPSA2XHJcbnRpZFxyXG5zdHLDpGNrYS90aWRcclxuMjUgPT0gc3Ryw6Rja2EvdGlkIFxyXG4zMCA9PSBzdHLDpGNrYS90aWRcclxuXHJcbiMgU3RyaW5nXHJcbmEgPSBcIlZvbHZvXCIgXHJcbjUgPT0gYS5sZW5ndGhcclxuJ2wnID09IGFbMl1cclxuXHJcbiMgTWF0aFxyXG41ID09IHNxcnQgMjUgXHJcblxyXG4jIERhdGVcclxuYyA9IG5ldyBEYXRlKCkgXHJcbmMuZ2V0RnVsbFllYXIoKVxyXG5jLmdldEhvdXJzKClcclxuXHJcbiMgQXJyYXlcclxubnVtYmVycyA9IFsxLDIsM10gXHJcbjIgPT0gbnVtYmVyc1sxXVxyXG5udW1iZXJzLnB1c2ggNDdcclxuNCA9PSBudW1iZXJzLmxlbmd0aFxyXG5udW1iZXJzIFxyXG40NyA9PSBudW1iZXJzLnBvcCgpXHJcbjMgPT0gbnVtYmVycy5sZW5ndGhcclxubnVtYmVyc1xyXG5hc3NlcnQgWzAsMSw0LDksMTYsMjUsMzYsNDksNjQsODFdLCAoeCp4IGZvciB4IGluIHJhbmdlIDEwKVxyXG5cclxuIyBPYmplY3RcclxucGVyc29uID0ge2ZuYW1uOidEYXZpZCcsIGVuYW1uOidMYXJzc29uJ31cclxuJ0RhdmlkJyA9PSBwZXJzb25bJ2ZuYW1uJ11cclxuJ0xhcnNzb24nID09IHBlcnNvbi5lbmFtblxyXG5cclxuIyBmdW5jdGlvbnMgKGVuYmFydCBvbmUgbGluZXJzIHRpbGzDpXRuYSEpXHJcbmt2YWRyYXQgPSAoeCkgLT4geCp4XHJcbjI1ID09IGt2YWRyYXQgNVxyXG5cclxuIyBmZWx1cHBza2F0dG5pbmcgdmlkIGFudsOkbmRhbmRlIGF2IGLDpHJpbmcgb2NoIGF2c3TDpW5kXHJcbmFyZWEgPSAoYjEsYjIscjEscjIpIC0+IChyMipyMiAtIHIxKnIxKSAqIE1hdGguUEkgKiAoYjItYjEpLzM2MCAgXHJcbjE3LjY3MTQ1ODY3NjQ0MjU4NyA9PSBhcmVhIDkwLDkxLDIwMCwyMDVcclxuMzUuMTI0NzUxMTk2Mzg1ODggID09IGFyZWEgOTAsOTEsNDAwLDQwNVxyXG42OS44MTMxNzAwNzk3NzMxNyAgPT0gYXJlYSA5MCw5MiwxOTUsMjA1XHJcbjEzOS42MjYzNDAxNTk1NDYzNCA9PSBhcmVhIDkwLDkyLDM5NSw0MDVcclxuXHJcbnNlcmlhbCA9IChhLGIpIC0+IGErYlxyXG4yID09IHNlcmlhbCAxLDFcclxuNSA9PSBzZXJpYWwgMiwzXHJcblxyXG5wYXJhbGxlbCA9IChhLGIpIC0+IGEqYi8oYStiKVxyXG4wLjUgPT0gcGFyYWxsZWwgMSwxXHJcbjEuMiA9PSBwYXJhbGxlbCAyLDNcclxuXHJcbmZhayA9ICh4KSAtPiBpZiB4PT0wIHRoZW4gMSBlbHNlIHggKiBmYWsoeC0xKVxyXG4zNjI4ODAwID09IGZhayAxMFxyXG5cclxuZmliID0gKHgpIC0+IGlmIHg8PTAgdGhlbiAxIGVsc2UgZmliKHgtMSkgKyBmaWIoeC0yKSBcclxuMSA9PSBmaWIgMFxyXG4yID09IGZpYiAxXHJcbjUgPT0gZmliIDNcclxuOCA9PSBmaWIgNFxyXG4xMyA9PSBmaWIgNVxyXG4yMSA9PSBmaWIgNlxyXG5cclxuZiA9ICh4KSA9PiA5Kip4IC0gNioqeCAtIDQqKnhcclxuc29sdmUgZiwwLDIsNTBcclxuXHJcblwiXCJcIlxyXG5cdFx0ZWxzZSAjIEphdmFzY3JpcHRcclxuXHRcdFx0bWVtb3J5ID0gXCJcIlwiIFxyXG4vLyBKYXZhc2NyaXB0XHJcbjIrM1xyXG5cclxuZGlzdGFuY2UgPSAxNTBcclxuc2Vjb25kcyA9IDZcclxuc2Vjb25kc1xyXG5kaXN0YW5jZS9zZWNvbmRzXHJcbjI1ID09IGRpc3RhbmNlL3NlY29uZHNcclxuMzAgPT0gZGlzdGFuY2Uvc2Vjb25kc1xyXG5cclxuLy8gU3RyaW5nXHJcbmEgPSBcIlZvbHZvXCIgXHJcbjUgPT0gYS5sZW5ndGhcclxuJ2wnID09IGFbMl1cclxuXHJcbi8vIE1hdGhcclxuNSA9PSBzcXJ0KDI1KVxyXG5cclxuLy8gRGF0ZVxyXG5jID0gbmV3IERhdGUoKSBcclxuYy5nZXRGdWxsWWVhcigpXHJcbmMuZ2V0SG91cnMoKVxyXG5cclxuLy8gQXJyYXlcclxubnVtYmVycyA9IFsxLDIsM10gXHJcbjIgPT0gbnVtYmVyc1sxXVxyXG5udW1iZXJzLnB1c2goNDcpXHJcbjQgPT0gbnVtYmVycy5sZW5ndGhcclxubnVtYmVycyBcclxuNDcgPT0gbnVtYmVycy5wb3AoKVxyXG4zID09IG51bWJlcnMubGVuZ3RoXHJcbm51bWJlcnNcclxuYXNzZXJ0KFswLDEsNCw5LDE2LDI1LDM2LDQ5LDY0LDgxXSwgcmFuZ2UoMTApLm1hcCh4ID0+IHgqeCkpXHJcblxyXG4vLyBPYmplY3RcclxucGVyc29uID0ge2ZuYW1uOidEYXZpZCcsIGVuYW1uOidMYXJzc29uJ31cclxuJ0RhdmlkJyA9PSBwZXJzb25bJ2ZuYW1uJ11cclxuJ0xhcnNzb24nID09IHBlcnNvbi5lbmFtblxyXG5cclxuLy8gZnVuY3Rpb25zIChvbmx5IG9uZSBsaW5lcnMpXHJcbmt2YWRyYXQgPSAoeCkgPT4geCp4XHJcbjI1ID09IGt2YWRyYXQoNSlcclxuXHJcbnNlcmlhbCA9IChhLGIpID0+IGErYlxyXG4yID09IHNlcmlhbCgxLDEpXHJcbjUgPT0gc2VyaWFsKDIsMylcclxuXHJcbnBhcmFsbGVsID0gKGEsYikgPT4gYSpiLyhhK2IpXHJcbjAuNSA9PSBwYXJhbGxlbCgxLDEpXHJcbjEuMiA9PSBwYXJhbGxlbCgyLDMpXHJcblxyXG5mYWsgPSAoeCkgPT4gKHg9PTAgPyAxIDogeCAqIGZhayh4LTEpKVxyXG4zNjI4ODAwID09IGZhaygxMClcclxuXHJcbmZpYiA9ICh4KSA9PiB4PD0wID8gMSA6IGZpYih4LTEpICsgZmliKHgtMilcclxuMSA9PSBmaWIoMClcclxuMiA9PSBmaWIoMSlcclxuNSA9PSBmaWIoMylcclxuOCA9PSBmaWIoNClcclxuMTMgPT0gZmliKDUpXHJcbjIxID09IGZpYig2KVxyXG5cclxuZiA9ICh4KSA9PiA5Kip4IC0gNioqeCAtIDQqKnhcclxuXHJcbnNvbHZlKGYsMCwyLDUwKVxyXG5cclxuXCJcIlwiXHJcblx0XHQjIHN0b3JlQW5kR290byBtZW1vcnkscGFnZVxyXG5cdFx0ZW5jb2RlKClcclxuXHJcblx0cGFnZS5hZGRBY3Rpb24gJ0hlbHAnLCAtPiB3aW5kb3cub3BlbiBcImh0dHBzOi8vZ2l0aHViLmNvbS9DaHJpc3Rlck5pbHNzb24vMjAyMy0wMDgtS2Fsa3lsIzAwOC1rYWxreWxcIlxyXG5cdHBhZ2UuYWRkQWN0aW9uICdIaWRlJywgLT4gcGFnZS5kaXNwbGF5KClcclxuXHRwYWdlLmFkZEFjdGlvbiAnVVJMJywgLT4gZW5jb2RlKClcclxuXHJcblx0cGFnZS5hZGRBY3Rpb24gQU5HTEVfTU9ERVtjb25maWcuYW5nbGVNb2RlXSwgLT5cclxuXHRcdGNvbmZpZy5hbmdsZU1vZGUgPSAxIC0gY29uZmlnLmFuZ2xlTW9kZVxyXG5cdFx0cGFnZS5hY3Rpb25zWzVdWzBdID0gQU5HTEVfTU9ERVtjb25maWcuYW5nbGVNb2RlXVxyXG5cdFx0bWFrZUFuc3dlcigpXHJcblx0XHRzdG9yZUFuZEdvdG8gbWVtb3J5LHBhZ2VcclxuXHJcblx0cGFnZS5hZGRBY3Rpb24gTEFOR1VBR0VbY29uZmlnLmxhbmd1YWdlXSwgLT5cclxuXHRcdGNvbmZpZy5sYW5ndWFnZSA9IDEgLSBjb25maWcubGFuZ3VhZ2VcclxuXHRcdHBhZ2UuYWN0aW9uc1s2XVswXSA9IExBTkdVQUdFW2NvbmZpZy5sYW5ndWFnZV1cclxuXHRcdHN0b3JlQW5kR290byBtZW1vcnkscGFnZVxyXG5cclxuXHRwYWdlLmFkZEFjdGlvbiBESVNQTEFZX01PREVbY29uZmlnLmRpc3BsYXlNb2RlXSwgLT5cclxuXHRcdGNvbmZpZy5kaXNwbGF5TW9kZSA9IDEgLSBjb25maWcuZGlzcGxheU1vZGVcclxuXHRcdHBhZ2UuYWN0aW9uc1s3XVswXSA9IERJU1BMQVlfTU9ERVtjb25maWcuZGlzcGxheU1vZGVdXHJcblx0XHRzdG9yZUFuZEdvdG8gbWVtb3J5LHBhZ2VcclxuXHJcblx0cGFnZS5hZGRBY3Rpb24gJ0xlc3MnLCAtPlxyXG5cdFx0aWYgY29uZmlnLmRpZ2l0cyA+IDEgdGhlbiBjb25maWcuZGlnaXRzLS1cclxuXHRcdHN0b3JlQW5kR290byBtZW1vcnkscGFnZVxyXG5cclxuXHRwYWdlLmFkZEFjdGlvbiAnTW9yZScsIC0+XHJcblx0XHRpZiBjb25maWcuZGlnaXRzIDwgMTcgdGhlbiBjb25maWcuZGlnaXRzKytcclxuXHRcdHN0b3JlQW5kR290byBtZW1vcnkscGFnZVxyXG5cclxuXHRwYWdlLmRpc3BsYXkoKVxyXG4iXX0=
//# sourceURL=c:\github\2023-008-Kalkyl\coffee\sketch.coffee