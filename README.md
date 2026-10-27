# WLiT Calculator

A responsive, browser-based calculator for everyday arithmetic. It is built with plain HTML, CSS, and JavaScript and needs no install or build step.

## Features

- Addition, subtraction, multiplication, and division with standard operator precedence
- Parentheses and percentage calculations
- Decimal input, sign toggle, delete, and clear controls
- Keyboard input
- Responsive layout for desktop and mobile screens
- Expression evaluation without JavaScript `eval`

## Run the Calculator

Open `index.html` in a browser. From PowerShell in this project folder, you can launch it in Microsoft Edge:

```powershell
Start-Process msedge "file:///D:/Projects/Calculator/index.html"
```

Or launch it in Google Chrome:

```powershell
Start-Process chrome "file:///D:/Projects/Calculator/index.html"
```

You can also open `index.html` from File Explorer and choose your preferred browser. No web server is required.

## Keyboard Controls

| Key | Action |
| --- | --- |
| `0`-`9`, `.` | Enter a number |
| `+`, `-`, `*`, `/` | Enter an operator |
| `(`, `)` | Enter parentheses |
| `%` | Apply percentage |
| `Enter` or `=` | Calculate |
| `Backspace` | Delete the last character |
| `Escape` | Clear the expression |

## Project Files

- `index.html` - page structure and calculator controls
- `styles.css` - responsive styling
- `calculator.js` - calculator input and expression evaluation