import { Component } from '@angular/core';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tic-tac-toe',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatIconModule,
    MatToolbarModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './tic-tac-toe.component.html',
  styleUrl: './tic-tac-toe.component.scss',
})
export class TicTacToeComponent {
  isLoading: boolean = false;
  squares: string[] = new Array(9).fill(null);
  isXNext: boolean = true;
  statement: string = 'Player X is next.';

  squareClicked(index: number) {
    if (this.squares[index] || this.calculateWinner(this.squares)) {
      return;
    }

    const nextSquares = this.squares.slice();
    nextSquares[index] = this.isXNext ? 'X' : 'O';
    this.squares = nextSquares;
    this.isXNext = !this.isXNext;

    const winner = this.calculateWinner(this.squares);

    if (winner) {
      if (winner === 'tie') {
        this.statement = `It is a tie!`;
      } else {
        this.statement = `Player ${winner} won!`;
        alert(this.statement);
      }
    } else {
      this.statement = `Player ${this.isXNext ? 'X' : 'O'} is next.`;
    }
  }

  calculateWinner(squares: string[]): string | null {
    let algo = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < algo.length; i++) {
      const [a, b, c] = algo[i];

      if (
        squares[a] &&
        squares[b] === squares[c] &&
        squares[a] === squares[b]
      ) {
        return squares[a];
      }
    }
    const tie = !squares.some((el) => el == null);
    return tie ? 'tie' : null;
  }

  resetGame() {
    this.squares = new Array(9).fill(null);
    this.statement = 'Player X is next.';
  }

  confirmReset() {
    const squaresChanged = this.squares.some((el) => el != null);
    if (!this.calculateWinner(this.squares) && squaresChanged) {
      let conResponse = confirm('Are you sure?');
      if (conResponse) {
        this.resetGame();
      } else {
        return;
      }
    } else {
      this.resetGame();
    }
  }
}
