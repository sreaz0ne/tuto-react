import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  let className = 'square';
    
  if (props.winnerCell)
    className += ' winner-cell';
  return (
    <button 
      className={className}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

function OrderBy(props) {
  return(
    <button onClick={props.onClick}>{props.value}</button>
  );
}

class Board extends React.Component {

  renderSquare(i, numberOfCellInASquareBoardRow) {
    return (
      <Square 
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i, numberOfCellInASquareBoardRow)}
        winnerCell={this.props.winnerRow !== null && this.props.winnerRow.length > 0 ? this.props.winnerRow.includes(i): false}
      />
    );
  }

  render() {
    const numberOfCellInASquareBoardRow = this.props.numberOfCellInASquareBoardRow;

    const board = [];
    for(let row = 0; row < numberOfCellInASquareBoardRow; row++) {
      const cells = [];
      for(let cell = 0; cell < numberOfCellInASquareBoardRow; cell++) {
        cells.push(this.renderSquare(row * numberOfCellInASquareBoardRow + cell, numberOfCellInASquareBoardRow));
      }
      board.push(<div key={row} className="board-row">{cells}</div>);
    }

    return (
      <div>
        {board}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    const numberOfCellInASquareBoardRow = this.props.numberOfCellInASquareBoardRow ? this.props.numberOfCellInASquareBoardRow  : 3;
    const numberOfCellInBoard = numberOfCellInASquareBoardRow * numberOfCellInASquareBoardRow;
    this.state = {
      history: [{
        squares: Array(numberOfCellInBoard).fill(null),
        squareIndexPlayed: null
      }],
      stepNumber: 0,
      xIsNext: true,
      orderByAsc: true
    };
  }

  handleClick(i, numberOfCellInASquareBoardRow) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1]; 
    const squares = current.squares.slice();
    if (calculateWinner(squares, numberOfCellInASquareBoardRow) !== null || squares[i]) {
      return;
    }
    const shapePlayed = this.state.xIsNext ? 'X' : 'O'
    squares[i] = shapePlayed;
    this.setState({
      history: history.concat([{
        squares: squares,
        squareIndexPlayed: i
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step){
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  toggleOrderBy() {
    this.setState({
      orderByAsc: !this.state.orderByAsc
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares, this.props.numberOfCellInASquareBoardRow);
    const moves = history.map((step, move) => {
      const moveCoordinates = getSquareCoordinates(this.props.numberOfCellInASquareBoardRow, step.squareIndexPlayed);
      const desc = move?
        'Revenir au tour n°' + move + ' : ' + step.squares[step.squareIndexPlayed] + ' (' + moveCoordinates.x + ':' + moveCoordinates.y + ')':
        'Revenir au début de la partie';
      return (
        <li key={move}>
          <button 
            className={move === this.state.stepNumber ? 'history-selected':''}
            onClick={() => this.jumpTo(move)}
          >
            {desc}
          </button>
        </li>
      );
    });

    if (!this.state.orderByAsc)
      moves.reverse();
      
    let status;
    if (winner !== null && winner.length > 0) {
      status = current.squares[winner[0]] + ' a gagné';
    } else if(winner !== null && winner.length === 0) {
      status = 'Match nul !'
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i, numberOfCellInASquareBoardRow) => this.handleClick(i, numberOfCellInASquareBoardRow)}
            numberOfCellInASquareBoardRow={this.props.numberOfCellInASquareBoardRow}
            winnerRow={winner}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <OrderBy 
            value={this.state.orderByAsc ? 'Croissant 🔼' : 'Décroissant 🔽'}
            onClick={() => this.toggleOrderBy()}
          />
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game numberOfCellInASquareBoardRow={3}/>,
  document.getElementById('root')
);

function calculateWinner(squares, numberOfCellInASquareBoardRow) {
  
  const isAllValueInRowIsTheSame = (cell, i, arr) => cell.value === arr[0].value && arr[0].value !== null;

  let currentRow = [];
  // First diagonal in the square
  for(let i = 0; i <= ((numberOfCellInASquareBoardRow - 1) * (numberOfCellInASquareBoardRow + 1)); i += numberOfCellInASquareBoardRow + 1) {
    currentRow.push({cellId: i, value: squares[i]});
  }

  if (currentRow.every(isAllValueInRowIsTheSame))
    return currentRow.map(cell => cell.cellId);

  // Second diagonalin the square
  currentRow = [];
  for(let i = numberOfCellInASquareBoardRow - 1; i <= (numberOfCellInASquareBoardRow * (numberOfCellInASquareBoardRow - 1)); i += numberOfCellInASquareBoardRow - 1) {
    currentRow.push({cellId: i, value: squares[i]});
  }

  if (currentRow.every(isAllValueInRowIsTheSame))
    return currentRow.map(cell => cell.cellId);
  
    
  // Vertical
  for (let i = 0; i < numberOfCellInASquareBoardRow; i++) {
    currentRow = [];
    for(let j = i; j <= (numberOfCellInASquareBoardRow * (numberOfCellInASquareBoardRow - 1)) + i; j += numberOfCellInASquareBoardRow) {
      currentRow.push({cellId: j, value: squares[j]});
    }

    if (currentRow.every(isAllValueInRowIsTheSame))
      return currentRow.map(cell => cell.cellId);
  }
  
  // Horizontal
  for (let i = 0; i <= numberOfCellInASquareBoardRow * (numberOfCellInASquareBoardRow - 1); i += numberOfCellInASquareBoardRow) {
    currentRow = [];
    for(let j = i; j < i + numberOfCellInASquareBoardRow; j++) {
      currentRow.push({cellId: j, value: squares[j]});
    }
    
    if (currentRow.every(isAllValueInRowIsTheSame))
      return currentRow.map(cell => cell.cellId);
  }
  
  if (!squares.includes(null))
    return []; 

  return null;
}

function getSquareCoordinates(numberOfCellInASquareBoardRow, index) {
  return {
    x: index % numberOfCellInASquareBoardRow + 1,
    y: Math.floor(index / numberOfCellInASquareBoardRow) + 1
  };
}