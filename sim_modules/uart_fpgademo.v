`default_nettype none
// Empty top module

module top (
  // I/O ports
  input  logic hz100, reset,
  input  logic [20:0] pb,
  output logic [7:0] left, right,
         ss7, ss6, ss5, ss4, ss3, ss2, ss1, ss0,
  output logic red, green, blue,

  // UART ports
  output logic [7:0] txdata,
  input  logic [7:0] rxdata,
  output logic txclk, rxclk,
  input  logic txready, rxready
);

  // Your code goes here...
  
  parameter STRLEN = 8*14-1;
  logic [STRLEN:0] str;
  initial str = "Hello world!\r\n";
  
  logic [7:0] next_txdata;
  logic [6:0] ctr;
  
  logic clk;
  assign clk = hz100;
  
  always_ff @(posedge clk, posedge reset)
  if (reset) begin
    txdata <= str[STRLEN:STRLEN-7];
    ctr <= STRLEN;
  end
  else begin
    txdata <= next_txdata;
    ctr <= ctr == 7 ? STRLEN : ctr - 8;
  end
  
  assign txclk = clk;
    
  always_comb next_txdata <= str[ctr -: 8];
  
endmodule