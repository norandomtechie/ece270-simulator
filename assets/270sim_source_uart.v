// Empty top module

module top (hz100, reset, pb, ss7, ss6, ss5, ss4, ss3, ss2, ss1, ss0, left, right, red, green, blue, txdata, txclk, txready, rxdata, rxclk, rxready);
  // I/O port bank
  input hz100, reset;
  input [20:0] pb;
  output [7:0] ss7, ss6, ss5, ss4, ss3, ss2, ss1, ss0, left, right;
  output red, green, blue;

  // UART transmit port bank
  output [7:0] txdata;
  output txclk; 
  input txready;
  
  // UART receive port bank
  input [7:0] rxdata;
  output rxclk; 
  input rxready;

  // Your code goes here...
  
endmodule

// Add more modules down here...