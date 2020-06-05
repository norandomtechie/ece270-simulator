module top (hz100, reset, pb, ss7, ss6, ss5, ss4, ss3, ss2, ss1, ss0, left, right, red, green, blue);
  input hz100, reset;
  input [20:0] pb;
  output [7:0] ss7, ss6, ss5, ss4, ss3, ss2, ss1, ss0, left, right;
  output red, green, blue;

  support sup (.clk (hz100), .reset (reset), .in (pb), .out7 (ss7), .out6 (ss6), .out5 (ss5), .out4 (ss4), .out3 (ss3), .out2 (ss2), .out1 (ss1), .out0 (ss0));

endmodule

module alu(out, fout, in1, in2, fin, op);
  output reg [31:0] out;
  output reg [3:0] fout;
  input [31:0] in1, in2;
  input [3:0] fin;
  input [4:0] op;

  // Replicate this table in idms module.
  localparam ALU_ADD = 5'd0;
  localparam ALU_ADC = 5'd1;
  localparam ALU_SUB = 5'd2;
  localparam ALU_SBC = 5'd3;
  localparam ALU_NEG = 5'd4;
  localparam ALU_LSL = 5'd5;
  localparam ALU_ASR = 5'd6;
  localparam ALU_LSR = 5'd7;
  localparam ALU_ROR = 5'd8;
  localparam ALU_OR  = 5'd9;
  localparam ALU_AND = 5'd10;
  localparam ALU_BIC = 5'd11;
  localparam ALU_XOR = 5'd12;
  localparam ALU_NOT = 5'd13;
  localparam ALU_SXB = 5'd14;
  localparam ALU_SXW = 5'd15;
  localparam ALU_ZXB = 5'd16;
  localparam ALU_ZXW = 5'd17;
  localparam ALU_IN1 = 5'd18;
  localparam ALU_IN2 = 5'd19;

  wire Nin, Zin, Cin, Vin;
  assign {Nin, Zin, Cin, Vin} = fin;

  wire N = 1; // REPLACE
  wire Z = 1; // REPLACE
  wire C = 1; // REPLACE
  wire V = 1; // REPLACE

  always @(*)
    case(op)
      ALU_ADD: begin out=in1 + in2; fout={N,Z,C,V}; end
      ALU_ADC: begin out=in1 + in2 + Cin; fout={N,Z,C,V}; end
      ALU_SUB: begin out=in1 - in2; fout={N,Z,C,V}; end
      ALU_SBC: begin out=in1 - in2 - Cin; fout={N,Z,C,V}; end
      ALU_NEG: begin out=-in1; fout={N,Z,Cin,Vin}; end
      ALU_OR:  begin out=-in1; fout={N,Z,Cin,Vin}; end
      ALU_AND: begin out=in1 & in2; fout={N,Z,Cin,Vin};end
      ALU_BIC: begin out=in1 & ~in2; fout={N,Z,Cin,Vin};end
      ALU_XOR: begin out=in1 ^ in2; fout={N,Z,Cin,Vin};end
      ALU_NOT: begin out=in1 ^ in2; fout={N,Z,Cin,Vin};end
      ALU_ZXB: begin out={24'b0, in2[7:0]}; fout={Nin,Zin,Cin,Vin};end
      ALU_IN1: begin out=in1; fout={Nin,Zin,Cin,Vin};end
      ALU_IN2: begin out=in2; fout={Nin,Zin,Cin,Vin};end

      // add the rest of the cases here...
      // default: begin out=0;      fout={Nin,Zin,Cin,Vin}; end
    endcase

endmodule

module ssdec (in, enable, out);
  input [3:0] in;
  input enable;
  output [7:0] out;
  
  assign out = enable ? in == 4'hF ? 8'b01110001 :
                        in == 4'hE ? 8'b01111001 :
                        in == 4'hd ? 8'b01011110 :
                        in == 4'hC ? 8'b00111001 :
                        in == 4'hB ? 8'b01111100 :
                        in == 4'hA ? 8'b01110111 :
                        in == 4'h9 ? 8'b01101111 :
                        in == 4'h8 ? 8'b01111111 :
                        in == 4'h7 ? 8'b00000111 :
                        in == 4'h6 ? 8'b01111101 :
                        in == 4'h5 ? 8'b01101101 :
                        in == 4'h4 ? 8'b01100110 :
                        in == 4'h3 ? 8'b01001111 :
                        in == 4'h2 ? 8'b01011011 :
                        in == 4'h1 ? 8'b00000110 : 8'b00111111 : 8'b0;
endmodule
module scankey (clk, reset, in, strobe, out);
  input clk, reset;
  input [19:0] in;
  output strobe;
  output [4:0] out;

  reg [1:0] delay;
  always @(posedge clk, posedge reset)
  if (reset)
    delay <= 0;
  else
    delay <= delay << 1 | |in;

  assign strobe = delay[1];
  assign out = in [19] ? 5'd19 :
                  in [18] ? 5'd18 :
                  in [17] ? 5'd17 :
                  in [16] ? 5'd16 :
                  in [15] ? 5'd15 :
                  in [14] ? 5'd14 :
                  in [13] ? 5'd13 :
                  in [12] ? 5'd12 :
                  in [11] ? 5'd11 :
                  in [10] ? 5'd10 :
                  in [ 9] ? 5'd9  :
                  in [ 8] ? 5'd8  :
                  in [ 7] ? 5'd7  :
                  in [ 6] ? 5'd6  :
                  in [ 5] ? 5'd5  :
                  in [ 4] ? 5'd4  :
                  in [ 3] ? 5'd3  :
                  in [ 2] ? 5'd2  :
                  in [ 1] ? 5'd1  : 5'd0;
endmodule
