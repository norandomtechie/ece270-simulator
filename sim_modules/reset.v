module reset_on_start(reset, clk, manual);
  output reset;
  input clk;
  input manual;

  reg [2:0] startup = 0;
  assign reset = startup[2] | manual;    // MSB drives the reset signal
  always @ (posedge clk, posedge manual)
    if (manual == 1)
      startup <= 0;             // start with reset low to get a rising edge
    else if (startup == 0)
      startup <= 4;             // hold reset high for 4 cycles
    else if (startup == 4)
      startup <= 5;
    else if (startup == 5)
      startup <= 6;
    else if (startup == 6)
      startup <= 7;
    else if (startup == 7)
      startup <= 1;             // Final state is 1.

endmodule
