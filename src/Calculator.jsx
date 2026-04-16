import { useState } from 'react'
import './Calculator.css'

function Calculator() {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [prevValue, setPrevValue] = useState(null)
  const [operator, setOperator] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [history, setHistory] = useState('')

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
      setHistory(`${prevValue} ${operator} ${inputValue} =`)
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

  return (
    <div className="calculator">
      <div className="display">
        <div className="history">{history || '\u00A0'}</div>
        <div className="expression">{expression || '\u00A0'}</div>
        <div className="value">{formatDisplay(display)}</div>
      </div>
      <div className="keypad">
        <button className="btn function" onClick={clear}>AC</button>
        <button className="btn function" onClick={toggleSign}>+/-</button>
        <button className="btn function" onClick={inputPercent}>%</button>
        <button className="btn operator" onClick={() => handleOperator('/')}>÷</button>

        <button className="btn number" onClick={() => inputDigit(7)}>7</button>
        <button className="btn number" onClick={() => inputDigit(8)}>8</button>
        <button className="btn number" onClick={() => inputDigit(9)}>9</button>
        <button className="btn operator" onClick={() => handleOperator('*')}>×</button>

        <button className="btn number" onClick={() => inputDigit(4)}>4</button>
        <button className="btn number" onClick={() => inputDigit(5)}>5</button>
        <button className="btn number" onClick={() => inputDigit(6)}>6</button>
        <button className="btn operator" onClick={() => handleOperator('-')}>−</button>

        <button className="btn number" onClick={() => inputDigit(1)}>1</button>
        <button className="btn number" onClick={() => inputDigit(2)}>2</button>
        <button className="btn number" onClick={() => inputDigit(3)}>3</button>
        <button className="btn operator" onClick={() => handleOperator('+')}>+</button>

        <button className="btn number zero" onClick={() => inputDigit(0)}>0</button>
        <button className="btn number" onClick={inputDecimal}>.</button>
        <button className="btn backspace" onClick={handleBackspace}>⌫</button>
        <button className="btn equals" onClick={handleEquals}>=</button>
      </div>
    </div>
  )
}

export default Calculator
