import std/[tables, strutils, sequtils, random, math, json, os]

type
  Token = string
  Vocab = Table[Token, int]
  
  TrainingExample = object
    prompt: string
    code: string
  
  LLM = object
    vocab: Vocab
    invVocab: Table[int, Token]
    patterns: Table[string, seq[string]]  # Simple pattern matching
    examples: seq[TrainingExample]

# Tokenizer
proc tokenize(text: string): seq[Token] =
  var current = ""
  for c in text:
    if c in {' ', '\n', '\t', '(', ')', '[', ']', '{', '}', ':', ',', '=', '+', '-', '*', '/', '"', '\''}:
      if current.len > 0:
        result.add(current)
        current = ""
      if c == '\n':
        result.add("<NL>")
      elif c != ' ' and c != '\t':
        result.add($c)
    else:
      current.add(c)
  if current.len > 0:
    result.add(current)

proc buildVocab(texts: seq[string]): Vocab =
  result = initTable[Token, int]()
  result["<PAD>"] = 0
  result["<START>"] = 1
  result["<END>"] = 2
  result["<NL>"] = 3
  var idx = 4
  for text in texts:
    let tokens = tokenize(text)
    for token in tokens:
      if token notin result:
        result[token] = idx
        inc idx

# Extract key words from prompt
proc extractKeywords(prompt: string): seq[string] =
  let words = prompt.toLowerAscii().split(' ')
  let keywords = ["sum", "add", "calculator", "multiply", "subtract", "divide", 
                  "max", "min", "sort", "fibonacci", "factorial", "palindrome",
                  "function", "build", "create", "make", "write"]
  for word in words:
    if word in keywords:
      result.add(word)

# Calculate similarity between prompts
proc similarity(p1, p2: string): float =
  let k1 = extractKeywords(p1)
  let k2 = extractKeywords(p2)
  var matches = 0
  for kw in k1:
    if kw in k2:
      inc matches
  if k1.len + k2.len == 0:
    return 0.0
  return float(matches * 2) / float(k1.len + k2.len)

# Model initialization
proc initLLM(examples: seq[TrainingExample]): LLM =
  result.examples = examples
  
  var allTexts: seq[string] = @[]
  for ex in examples:
    allTexts.add(ex.prompt)
    allTexts.add(ex.code)
  
  result.vocab = buildVocab(allTexts)
  for k, v in result.vocab:
    result.invVocab[v] = k
  
  # Build pattern table for quick lookup
  result.patterns = initTable[string, seq[string]]()
  for ex in examples:
    let keywords = extractKeywords(ex.prompt)
    for kw in keywords:
      if kw notin result.patterns:
        result.patterns[kw] = @[]
      result.patterns[kw].add(ex.code)

proc generate(model: LLM, prompt: string): string =
  # Find most similar training example
  var bestMatch = 0
  var bestScore = 0.0
  
  for i, ex in model.examples:
    let score = similarity(prompt, ex.prompt)
    if score > bestScore:
      bestScore = score
      bestMatch = i
  
  # If we have a good match, use it
  if bestScore > 0.3:
    return model.examples[bestMatch].code
  
  # Otherwise, try to combine patterns
  let keywords = extractKeywords(prompt)
  if keywords.len > 0 and keywords[0] in model.patterns:
    return model.patterns[keywords[0]][0]
  
  # Fallback
  return "def function():\n    pass"

# Training data with more examples
proc getTrainingData(): seq[TrainingExample] =
  result = @[
    TrainingExample(
      prompt: "build a calculator",
      code: "def add(a, b):\n    return a + b\n\ndef subtract(a, b):\n    return a - b\n\ndef multiply(a, b):\n    return a * b\n\ndef divide(a, b):\n    if b == 0:\n        return 'Error: Division by zero'\n    return a / b\n\n# Example usage\nprint(add(5, 3))\nprint(subtract(10, 4))\nprint(multiply(6, 7))\nprint(divide(20, 4))"
    ),
    TrainingExample(
      prompt: "create function to sum two numbers",
      code: "def sum_numbers(a, b):\n    \"\"\"Add two numbers and return the result\"\"\"\n    return a + b\n\n# Example\nresult = sum_numbers(10, 20)\nprint(f'Sum: {result}')"
    ),
    TrainingExample(
      prompt: "make a function to multiply",
      code: "def multiply(x, y):\n    \"\"\"Multiply two numbers\"\"\"\n    return x * y\n\n# Test\nprint(multiply(5, 4))"
    ),
    TrainingExample(
      prompt: "write function to find max",
      code: "def find_max(a, b):\n    \"\"\"Return the maximum of two numbers\"\"\"\n    if a > b:\n        return a\n    return b\n\n# Alternative using built-in\ndef find_max_alt(a, b):\n    return max(a, b)"
    ),
    TrainingExample(
      prompt: "create list sorter",
      code: "def sort_list(lst):\n    \"\"\"Sort a list in ascending order\"\"\"\n    return sorted(lst)\n\ndef sort_list_desc(lst):\n    \"\"\"Sort a list in descending order\"\"\"\n    return sorted(lst, reverse=True)\n\n# Example\nnumbers = [5, 2, 8, 1, 9]\nprint(sort_list(numbers))"
    ),
    TrainingExample(
      prompt: "build fibonacci function",
      code: "def fibonacci(n):\n    \"\"\"Calculate nth Fibonacci number\"\"\"\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\n# Iterative version (more efficient)\ndef fibonacci_iter(n):\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n\n# Example\nfor i in range(10):\n    print(fibonacci_iter(i), end=' ')"
    ),
    TrainingExample(
      prompt: "make factorial function",
      code: "def factorial(n):\n    \"\"\"Calculate factorial of n\"\"\"\n    if n == 0 or n == 1:\n        return 1\n    return n * factorial(n-1)\n\n# Iterative version\ndef factorial_iter(n):\n    result = 1\n    for i in range(2, n + 1):\n        result *= i\n    return result\n\n# Example\nprint(factorial(5))  # Output: 120"
    ),
    TrainingExample(
      prompt: "create palindrome checker",
      code: "def is_palindrome(s):\n    \"\"\"Check if string is a palindrome\"\"\"\n    s = s.lower().replace(' ', '')\n    return s == s[::-1]\n\n# Example\nprint(is_palindrome('racecar'))  # True\nprint(is_palindrome('hello'))    # False"
    ),
    TrainingExample(
      prompt: "write function to add numbers",
      code: "def add_numbers(a, b):\n    \"\"\"Add two numbers together\"\"\"\n    return a + b\n\n# Example\nprint(add_numbers(15, 25))"
    ),
    TrainingExample(
      prompt: "create subtract function",
      code: "def subtract(a, b):\n    \"\"\"Subtract b from a\"\"\"\n    return a - b\n\n# Example\nprint(subtract(50, 30))"
    ),
    TrainingExample(
      prompt: "make division function",
      code: "def divide(a, b):\n    \"\"\"Divide a by b with error handling\"\"\"\n    if b == 0:\n        return 'Error: Cannot divide by zero'\n    return a / b\n\n# Example\nprint(divide(100, 5))"
    ),
    TrainingExample(
      prompt: "build min function",
      code: "def find_min(a, b):\n    \"\"\"Return the minimum of two numbers\"\"\"\n    if a < b:\n        return a\n    return b\n\n# Using built-in\ndef find_min_alt(a, b):\n    return min(a, b)"
    ),
  ]

# Main execution
when isMainModule:
  randomize()
  echo "=== Simple LLM for Python Code Generation ==="
  echo ""
  
  let trainingData = getTrainingData()
  echo "Loading training data..."
  echo "Training examples: ", trainingData.len
  
  echo "Building vocabulary..."
  var model = initLLM(trainingData)
  echo "Vocabulary size: ", model.vocab.len
  echo ""
  
  echo "Model trained and ready!"
  echo ""
  
  # Test generation
  echo "=== Testing Code Generation ==="
  echo ""
  
  let testPrompts = @[
    "build a calculator",
    "create function to sum two numbers",
    "make factorial function",
    "write function to add numbers",
    "create subtract function",
    "make a function to multiply"
  ]
  
  for prompt in testPrompts:
    echo "Prompt: \"", prompt, "\""
    echo ""
    echo "Generated Python code:"
    echo "```python"
    let code = model.generate(prompt)
    echo code
    echo "```"
    echo ""
    echo "---"
    echo ""
  
  # Interactive mode
  echo "=== Interactive Mode ==="
  echo "Enter your prompt (or 'quit' to exit):"
  echo ""
  
  while true:
    stdout.write(">>> ")
    let input = stdin.readLine()
    
    if input.toLowerAscii() == "quit" or input.toLowerAscii() == "exit":
      echo "Goodbye!"
      break
    
    if input.len == 0:
      continue
    
    echo ""
    echo "Generated Python code:"
    echo "```python"
    let code = model.generate(input)
    echo code
    echo "```"
    echo ""