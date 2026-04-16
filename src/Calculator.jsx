import { useState, useEffect, useRef } from 'react'
import './Calculator.css'

function Calculator() {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [prevValue, setPrevValue] = useState(null)
  const [operator, setOperator] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [history, setHistory] = useState('')
  const [activeKey, setActiveKey] = useState(null)
  const calculatorRef = useRef(null)

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit))
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }
    if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const clear = () => {
    setDisplay('0')
    setExpression('')
    setPrevValue(null)
    setOperator(null)
    setWaitingForOperand(false)
    setHistory('')
  }

  const toggleSign = () => {
    if (display !== '0') {
      setDisplay(display.charAt(0) === '-' ? display.slice(1) : '-' + display)
    }
  }

  const inputPercent = () => {
    const value = parseFloat(display)
    setDisplay(String(value / 100))
  }

  const calculate = (nextOperator) => {
    const inputValue = parseFloat(display)

    if (prevValue == null) {
      setPrevValue(inputValue)
      setExpression(`${display} ${nextOperator}`)
    } else if (operator) {
      const result = performCalculation(operator, prevValue, inputValue)
      setDisplay(String(result))
      setPrevValue(result)
      setExpression(`${result} ${nextOperator}`)
    }

    setWaitingForOperand(true)
    setOperator(nextOperator)
  }

  const performCalculation = (op, a, b) => {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '*': return a * b
      case '/': return b !== 0 ? a / b : 'Error'
      default: return b
    }
  }

  const handleOperator = (nextOperator) => {
    calculate(nextOperator)
  }

  const handleEquals = () => {
    if (operator && prevValue != null) {
      const inputValue = parseFloat(display)
      const result = performCalculation(operator, prevValue, inputValue)
      const displayOp = { '+': '+', '-': '−', '*': '×', '/': '÷' }[operator] || operator
      setHistory(`${prevValue} ${displayOp} ${inputValue} =`)
      setDisplay(String(result))
      setPrevValue(null)
      setOperator(null)
      setWaitingForOperand(true)
      setExpression('')
    }
  }

  const handleBackspace = () => {
    if (waitingForOperand) return
    if (display.length === 1 || (display.length === 2 && display.charAt(0) === '-')) {
      setDisplay('0')
    } else {
      setDisplay(display.slice(0, -1))
    }
  }

  const formatDisplay = (value) => {
    if (value === 'Error') return value
    const num = parseFloat(value)
    if (isNaN(num)) return '0'
    if (value.endsWith('.')) return value
    if (value.includes('.') && value.endsWith('0') && !waitingForOperand) return value
    if (Math.abs(num) > 999999999999) return num.toExponential(4)
    return value
  }

  // Keyboard mapping: key -> button label for visual feedback
  const keyMap = {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    '.': '.', ',': '.',
    '+': '+', '-': '−', '*': '×', '/': '÷',
    'Enter': '=', '=': '=',
    'Backspace': '⌫', 'Delete': 'AC', 'Escape': 'AC',
    '%': '%',
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default for calculator keys (e.g. '/' would open browser search)
      if (keyMap[e.key]) {
        e.preventDefault()
      }

      const key = e.key

      // Numbers 0-9
      if (/^[0-9]$/.test(key)) {
        inputDigit(parseInt(key))
        setActiveKey(key)
        return
      }

      // Decimal point
      if (key === '.' || key === ',') {
        inputDecimal()
        setActiveKey('.')
        return
      }

      // Operators
      if (key === '+') {
        handleOperator('+')
        setActiveKey('+')
        return
      }
      if (key === '-') {
        handleOperator('-')
        setActiveKey('−')
        return
      }
      if (key === '*') {
        handleOperator('*')
        setActiveKey('×')
        return
      }
      if (key === '/') {
        handleOperator('/')
        setActiveKey('÷')
        return
      }

      // Equals / Enter
      if (key === 'Enter' || key === '=') {
        handleEquals()
        setActiveKey('=')
        return
      }

      // Backspace
      if (key === 'Backspace') {
        handleBackspace()
        setActiveKey('⌫')
        return
      }

      // Clear
      if (key === 'Escape' || key === 'Delete') {
        clear()
        setActiveKey('AC')
        return
      }

      // Percent
      if (key === '%') {
        inputPercent()
        setActiveKey('%')
        return
      }

      // Toggle sign with F9 or 's' key
      if (key === 'F9' || key === 's' || key === 'S') {
        toggleSign()
        setActiveKey('+/-')
        return
      }
    }

    const handleKeyUp = () => {
      setActiveKey(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [display, operator, prevValue, waitingForOperand])

  // Helper to determine if a button should show active state
  const isActive = (label) => activeKey === label

  return (
    <div className="calculator" ref={calculatorRef}>
      <div className="display">
        <div className="history">{history || '\u00A0'}</div>
        <div className="expression">{expression || '\u00A0'}</div>
        <div className="value">{formatDisplay(display)}</div>
      </div>
      <div className="keyboard-hint">
        Keyboard: 0-9, +−×÷, Enter, Esc, Backspace, %, S (+/-)
      </div>
      <div className="keypad">
        <button className={`btn function ${isActive('AC') ? 'active' : ''}`} onClick={clear}>AC</button>
        <button className={`btn function ${isActive('+/-') ? 'active' : ''}`} onClick={toggleSign}>+/-</button>
        <button className={`btn function ${isActive('%') ? 'active' : ''}`} onClick={inputPercent}>%</button>
        <button className={`btn operator ${isActive('÷') ? 'active' : ''}`} onClick={() => handleOperator('/')}>÷</button>

        <button className={`btn number ${isActive('7') ? 'active' : ''}`} onClick={() => inputDigit(7)}>7</button>
        <button className={`btn number ${isActive('8') ? 'active' : ''}`} onClick={() => inputDigit(8)}>8</button>
        <button className={`btn number ${isActive('9') ? 'active' : ''}`} onClick={() => inputDigit(9)}>9</button>
        <button className={`btn operator ${isActive('×') ? 'active' : ''}`} onClick={() => handleOperator('*')}>×</button>

        <button className={`btn number ${isActive('4') ? 'active' : ''}`} onClick={() => inputDigit(4)}>4</button>
        <button className={`btn number ${isActive('5') ? 'active' : ''}`} onClick={() => inputDigit(5)}>5</button>
        <button className={`btn number ${isActive('6') ? 'active' : ''}`} onClick={() => inputDigit(6)}>6</button>
        <button className={`btn operator ${isActive('−') ? 'active' : ''}`} onClick={() => handleOperator('-')}>−</button>

        <button className={`btn number ${isActive('1') ? 'active' : ''}`} onClick={() => inputDigit(1)}>1</button>
        <button className={`btn number ${isActive('2') ? 'active' : ''}`} onClick={() => inputDigit(2)}>2</button>
        <button className={`btn number ${isActive('3') ? 'active' : ''}`} onClick={() => inputDigit(3)}>3</button>
        <button className={`btn operator ${isActive('+') ? 'active' : ''}`} onClick={() => handleOperator('+')}>+</button>

        <button className={`btn number zero ${isActive('0') ? 'active' : ''}`} onClick={() => inputDigit(0)}>0</button>
        <button className={`btn number ${isActive('.') ? 'active' : ''}`} onClick={inputDecimal}>.</button>
        <button className={`btn backspace ${isActive('⌫') ? 'active' : ''}`} onClick={handleBackspace}>⌫</button>
        <button className={`btn equals ${isActive('=') ? 'active' : ''}`} onClick={handleEquals}>=</button>
      </div>
    </div>
  )
}

export default Calculator
