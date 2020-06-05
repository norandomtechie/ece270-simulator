// Empty top module

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
  
  reg [7:0] ctr;
  always @(posedge hz100, posedge reset)
  if (reset)
    ctr <= 0;
  else
    ctr <= ctr == 8'd49 ? ctr + 1 : 0;

  reg x;
  always @(posedge (ctr == 8'd49), posedge reset)
  if (reset)
    x <= 0;
  else
    x <= ~x;

  assign right = x;

endmodule

/*module ssdec(out, in, enable);
    output wire [7:0] out; // seven segment output
    input  wire [3:0] in;  // four-bit value to be displayed
    input  wire       enable;// Should we turn any segments on?

    localparam blank = 8'b00000000;
    localparam char0 = 8'b00111111;
    localparam char1 = 8'b00000110;
    localparam char2 = 8'b01011011;
    localparam char3 = 8'b01001111;
    localparam char4 = 8'b01100110;
    localparam char5 = 8'b01101101;
    localparam char6 = 8'b01111101;
    localparam char7 = 8'b00000111;
    localparam char8 = 8'b01111111;
    localparam char9 = 8'b01101111;
    localparam charA = 8'b01110111;
    localparam charB = 8'b01111100;
    localparam charC = 8'b00111001;
    localparam charD = 8'b01011110;
    localparam charE = 8'b01111001;
    localparam charF = 8'b01110001;

    wire [7:0] map [15:0];
    assign map[0] = char0;
    assign map[1] = char1;
    assign map[2] = char2;
    assign map[3] = char3;
    assign map[4] = char4;
    assign map[5] = char5;
    assign map[6] = char6;
    assign map[7] = char7;
    assign map[8] = char8;
    assign map[9] = char9;
    assign map[10] = charA;
    assign map[11] = charB;
    assign map[12] = charC;
    assign map[13] = charD;
    assign map[14] = charE;
    assign map[15] = charF;
    assign out =  enable == 1 ? map[in] : blank;
endmodule*/
