/*************************************************************
    Welcome to the new ice40HX8K simulation board!
    This demo is pretty straightforward. Press 1 or click
    on the button 1 to reset all flip flops and start the
    different counters on all the outputs.
**************************************************************/

module top (hz100, reset, pb, ss7, ss6, ss5, ss4, ss3, ss2, ss1, ss0, left, right, red, green, blue);

  input hz100;
  input reset;
  input [20:0] pb;
  output [7:0] ss7;
  output [7:0] ss6;
  output [7:0] ss5;
  output [7:0] ss4;
  output [7:0] ss3;
  output [7:0] ss2;
  output [7:0] ss1;
  output [7:0] ss0;
  output [7:0] left;
  output [7:0] right;
  output red;
  output green;
  output blue;

  assign {left, right, ss7, ss6, ss5, ss4, ss3, ss2, ss1, ss0, red, green, blue} = {83{hz100}};

endmodule
