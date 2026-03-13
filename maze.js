const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

let rows = 20;
let cols = 20;
let cellSize = 30;

class Cell {
  constructor(r,c){
    this.r=r;
    this.c=c;
    this.visited=false;
    this.walls=[true,true,true,true];
  }
}

let grid=[];

function createGrid(){
  grid=[];
  for(let r=0;r<rows;r++){
    let row=[];
    for(let c=0;c<cols;c++){
      row.push(new Cell(r,c));
    }
    grid.push(row);
  }
}

function neighbors(cell){

  let list=[];
  let r=cell.r;
  let c=cell.c;

  if(r>0 && !grid[r-1][c].visited) list.push(grid[r-1][c]);
  if(c<cols-1 && !grid[r][c+1].visited) list.push(grid[r][c+1]);
  if(r<rows-1 && !grid[r+1][c].visited) list.push(grid[r+1][c]);
  if(c>0 && !grid[r][c-1].visited) list.push(grid[r][c-1]);

  return list;
}

function removeWalls(a,b){

  let dx=a.c-b.c;
  let dy=a.r-b.r;

  if(dx==1){a.walls[3]=false;b.walls[1]=false;}
  if(dx==-1){a.walls[1]=false;b.walls[3]=false;}

  if(dy==1){a.walls[0]=false;b.walls[2]=false;}
  if(dy==-1){a.walls[2]=false;b.walls[0]=false;}

}

function generateMaze(){

  createGrid();

  let stack=[];
  let start=grid[0][0];
  start.visited=true;

  stack.push(start);

  while(stack.length>0){

    let current=stack[stack.length-1];

    let n=neighbors(current);

    if(n.length>0){

      let next=n[Math.floor(Math.random()*n.length)];

      next.visited=true;

      removeWalls(current,next);

      stack.push(next);

    }else{

      stack.pop();

    }

  }

  drawMaze();

}

function drawMaze(){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  cellSize=canvas.width/cols;

  ctx.lineWidth=2;

  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){

      let cell=grid[r][c];

      let x=c*cellSize;
      let y=r*cellSize;

      if(cell.walls[0]) line(x,y,x+cellSize,y);
      if(cell.walls[1]) line(x+cellSize,y,x+cellSize,y+cellSize);
      if(cell.walls[2]) line(x,y+cellSize,x+cellSize,y+cellSize);
      if(cell.walls[3]) line(x,y,x,y+cellSize);

    }
  }

}

function line(x1,y1,x2,y2){

  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();

}

generateMaze();
