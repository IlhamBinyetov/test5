import { useState, useEffect, useRef, useCallback } from 'react'
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

  const inputDigit = useCallback((digit) => {
    setDisplay(prev => {
      if (waitingForOperand) {
        setWaitingForOperand(false)
        return String(digit)
      }
      return prev === '0' ? String(digit) : prev + digit
    })
  }, [waitingForOperand])

  const inputDecimal = useCallback(() => {
    setDisplay(prev => {
      if (waitingForOperand) {
        setWaitingForOperand(false)
        return '0.'
      }
      if (!prev.includes('.')) {
        return prev + '.'
      }
      return prev
    })
  }, [waitingForOperand])

  const clear = useCallback(() => {
    setDisplay('0')
    setExpression('')
    setPrevValue(null)
    setOperator(null)
    setWaitingForOperand(false)
    setHistory('')
  }, [])

  const toggleSign = useCallback(() => {
    setDisplay(prev => {
      if (prev !== '0') {
        return prev.charAt(0) === '-' ? prev.slice(1) : '-' + prev
      }
      return prev
    })
  }, [])

  const inputPercent = useCallback(() => {
    setDisplay(prev => String(parseFloat(prev) / 100))
  }, [])

  const performCalculation = useCallback((op, a, b) => {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '*': return a * b
      case '/': return b !== 0 ? a / b : 'Error'
      default: return b
    }
  }, [])

  const handleOperator = useCallback((nextOperator) => {
    const inputValue = parseFloat(display)

    setPrevValue(prev => {
      if (prev == null) {
        setExpression(`${display} ${nextOperator}`)
        setWaitingForOperand(true)
        setOperator(nextOperator)
        return inputValue
      } else {
        const result = performCalculation(operator, prev, inputValue)
        setDisplay(String(result))
        setExpression(`${result} ${nextOperator}`)
        setWaitingForOperand(true)
        setOperator(nextOperator)
        return result
      }
    })
  }, [display, operator, performCalculation])

  const handleEquals = useCallback(() => {
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
  }, [operator, prevValue, display, performCalculation])

  const handleBackspace = useCallback(() => {
    if (waitingForOperand) return
    setDisplay(prev => {
      if (prev.length === 1 || (prev.length === 2 && prev.charAt(0) === '-')) {
        return '0'
      }
      return prev.slice(0, -1)
    })
  }, [waitingForOperand])

  const formatDisplay = (value) => {
    if (value === 'Error') return value
    const num = parseFloat(value)
    if (isNaN(num)) return '0'
    if (value.endsWith('.')) return value
    if (value.includes('.') && value.endsWith('0') && !waitingForOperand) return value
    if (Math.abs(num) > 999999999999) return num.toExponential(4)
    return value
  }

  // Prevent buttons from stealing focus - THIS IS THE KEY FIX
  const preventFocus = (e) => {
    e.preventDefault()
  }

  // Auto-focus calculator on mount and keep focus
  useEffect(() => {
    // Focus the calculator div so it receives keyboard events
    if (calculatorRef.current) {
      calculatorRef.current.focus()
    }
  }, [])

  // Refocus calculator when clicking anywhere inside it
  const handleCalculatorClick = () => {
    if (calculatorRef.current) {
      calculatorRef.current.focus()
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key

      // Numbers 0-9
      if (/^[0-9]$/.test(key)) {
        e.preventDefault()
        inputDigit(parseInt(key))
        setActiveKey(key)
        return
      }

      // Decimal point
      if (key === '.' || key === ',') {
        e.preventDefault()
        inputDecimal()
        setActiveKey('.')
        return
      }

      // Operators
      if (key === '+') {
        e.preventDefault()
        handleOperator('+')
        setActiveKey('+')
        return
      }
      if (key === '-') {
        e.preventDefault()
        handleOperator('-')
        setActiveKey('−')
        return
      }
      if (key === '*') {
        e.preventDefault()
        handleOperator('*')
        setActiveKey('×')
        return
      }
      if (key === '/') {
        e.preventDefault()
        handleOperator('/')
        setActiveKey('÷')
        return
      }

      // Equals / Enter
      if (key === 'Enter' || key === '=') {
        e.preventDefault()
        handleEquals()
        setActiveKey('=')
        return
      }

      // Backspace
      if (key === 'Backspace') {
        e.preventDefault()
        handleBackspace()
        setActiveKey('⌫')
        return
      }

      // Clear
      if (key === 'Escape' || key === 'Delete') {
        e.preventDefault()
        clear()
        setActiveKey('AC')
        return
      }

      // Percent
      if (key === '%') {
        e.preventDefault()
        inputPercent()
        setActiveKey('%')
        return
      }

      // Toggle sign with F9 or 's' key
      if (key === 'F9' || key === 's' || key === 'S') {
        e.preventDefault()
        toggleSign()
        setActiveKey('+/-')
        return
      }
    }

    const handleKeyUp = () => {
      setActiveKey(null)
    }

    // Use document instead of window for better Codespace/iframe support
    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('keyup', handleKeyUp, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('keyup', handleKeyUp, true)
    }
  }, [inputDigit, inputDecimal, handleOperator, handleEquals, handleBackspace, clear, toggleSign, inputPercent])

  const isActive = (label) => activeKey === label

  return (
    <div
      className="calculator"
      ref={calculatorRef}
      tabIndex={0}
      onClick={handleCalculatorClick}
      onBlur={(e) => {
        // Refocus if focus leaves the calculator
        // Use setTimeout to avoid focus fights
        setTimeout(() => {
          if (calculatorRef.current && !calculatorRef.current.contains(document.activeElement)) {
            calculatorRef.current.focus()
          }
        }, 10)
      }}
    >
      <div className="display">
        <div className="history">{history || '\u00A0'}</div>
        <div className="expression">{expression || '\u00A0'}</div>
        <div className="value">{formatDisplay(display)}</div>
      </div>
      <div className="keyboard-hint">
        Keyboard: 0-9, +−×÷, Enter, Esc, Backspace, %, S (+/-)
      </div>
      <div className="keypad">
        <button className={`btn function ${isActive('AC') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={clear}>AC</button>
        <button className={`btn function ${isActive('+/-') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={toggleSign}>+/-</button>
        <button className={`btn function ${isActive('%') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={inputPercent}>%</button>
        <button className={`btn operator ${isActive('÷') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={() => handleOperator('/')}>÷</button>

        <button className={`btn number ${isActive('7') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={() => inputDigit(7)}>7</button>
        <button className={`btn number ${isActive('8') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={() => inputDigit(8)}>8</button>
        <button className={`btn number ${isActive('9') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={() => inputDigit(9)}>9</button>
        <button className={`btn operator ${isActive('×') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={() => handleOperator('*')}>×</button>

        <button className={`btn number ${isActive('4') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={() => inputDigit(4)}>4</button>
        <button className={`btn number ${isActive('5') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={() => inputDigit(5)}>5</button>
        <button className={`btn number ${isActive('6') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={() => inputDigit(6)}>6</button>
        <button className={`btn operator ${isActive('−') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={() => handleOperator('-')}>−</button>

        <button className={`btn number ${isActive('1') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={() => inputDigit(1)}>1</button>
        <button className={`btn number ${isActive('2') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={() => inputDigit(2)}>2</button>
        <button className={`btn number ${isActive('3') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={() => inputDigit(3)}>3</button>
        <button className={`btn operator ${isActive('+') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={() => handleOperator('+')}>+</button>

        <button className={`btn number zero ${isActive('0') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={() => inputDigit(0)}>0</button>
        <button className={`btn number ${isActive('.') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={inputDecimal}>.</button>
        <button className={`btn backspace ${isActive('⌫') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={handleBackspace}>⌫</button>
        <button className={`btn equals ${isActive('=') ? 'active' : ''}`} onMouseDown={preventFocus} onClick={handleEquals}>=</button>
      </div>
    </div>
  )
}

export default Calculator
