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

  logic [7:0] div, div2, div3, div4;
  logic hz4, hz2, hz1, hzf;
  
  assign red = hz4;
  assign green = hz2;
  assign blue = hz1;
  
  always_ff @(posedge hz100, posedge reset)
    if (reset) begin
      div <= 0; div2 <= 0; div3 <= 0;  
      hz2 <= 0; hz4 <= 0;  hz1 <= 0; 
    end
    else if (div == 8'd49) begin
      div <= 0;
      hz1 <= ~hz1;
    end
    else if (div2 == 8'd24) begin
      div2 <= 0;
      hz2 <= ~hz2;
    end
    else if (div3 == 8'd12) begin
      div3 <= 0;
      hz4 <= ~hz4;
    end
    else if (div4 == 8'd2) begin
      div4 <= 0;
      hzf <= ~hzf;
    end
    else begin
      {div, div2, div3, div4} <= {div, div2, div3, div4} + 32'h01010101;
    end
    
  ssdec s7 (num[3:0], 1'b1, ss7);
  ssdec s6 (num[3:0], 1'b1, ss6);
  ssdec s5 (num[3:0], 1'b1, ss5);
  ssdec s4 (num[3:0], 1'b1, ss4);
  ssdec s3 (num[3:0], 1'b1, ss3);
  ssdec s2 (num[3:0], 1'b1, ss2);
  ssdec s1 (num[3:0], 1'b1, ss1);
  ssdec s0 (num[3:0], 1'b1, ss0);
  
  logic [3:0] num;
  logic clk;
  assign clk = pb[0] ? hzf : pb[1] ? hz4 : pb[2] ? hz2 : hz1;
  always_ff @(posedge clk, posedge reset)
    if (reset)
      num <= 0;
    else
      num <= num + 1;
  
  always @(posedge clk, posedge reset) begin
    if (reset) begin
      {left, right} <= 0;
    end
    else begin
      left <= left >> 1 | {~left[0], 7'b0};
      right <= right << 1 | {7'b0, ~right[7]};
    end
  end
  
endmodule

module ssdec(in, en, out);
  input logic [3:0] in;
  input logic en;
  output logic [7:0] out;

  logic [15:0] pos; // ypos is the positively-asserted version of the output
  assign pos = {in[3] & in[2] & in[1] & in[0],
  in[3] & in[2] & in[1] & ~in[0],
  in[3] & in[2] & ~in[1] &  in[0], 
  in[3] & in[2] & ~in[1] & ~in[0],
  in[3] & ~in[2] &  in[1] & in[0],
  in[3] & ~in[2] &  in[1] & ~in[0],
  in[3] & ~in[2] & ~in[1] & in[0],
  in[3] & ~in[2] & ~in[1] & ~in[0],
  ~in[3] &  in[2] & in[1] & in[0],
  ~in[3] &  in[2] & in[1] & ~in[0],
  ~in[3] &  in[2] & ~in[1] &  in[0],
  ~in[3] &  in[2] & ~in[1] & ~in[0],
  ~in[3] & ~in[2] & in[1] & in[0],
  ~in[3] & ~in[2] & in[1] & ~in[0],
  ~in[3] & ~in[2] & ~in[1] & in[0],
  ~in[3] & ~in[2] & ~in[1] & ~in[0] };

  assign out[0] = en & ~(pos[1] | pos[4] | pos[11] | pos[13]);
  assign out[1] = en & ~(pos[5] | pos[6] | pos[11] | pos[12] | pos[14] | pos[15]);
  assign out[2] = en & ~(pos[2] | pos[12]| pos[14] | pos[15]);
  assign out[3] = en & ~(pos[1] | pos[4] | pos[7] | pos[9] | pos[10] | pos[15]);
  assign out[4] = en & ~(pos[1] | pos[3] | pos[5] | pos[7] | pos[9] | pos[4]);
  assign out[5] = en & ~(pos[1] | pos[2] | pos[3] | pos[7] | pos[13]);
  assign out[6] = en & ~(pos[0] | pos[1] | pos[7] | pos[12]);
  assign out[7] = 1'b0;

endmodule

