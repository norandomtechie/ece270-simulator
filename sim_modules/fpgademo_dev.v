/*************************************************************
    Welcome to the new ice40HX8K simulation board!
    This demo is pretty straightforward. Press 1 or click
    on the button 1 to reset all flip flops and start the
    different counters on all the outputs.
**************************************************************/

module top (hz100, pb, ss7, ss6, ss5, ss4, ss3, ss2, ss1, ss0, left, right, red, green, blue);

  input hz100;
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
  localparam charG = 8'b01101111;
  localparam charH = 8'b01110110;
  localparam charI = 8'b00000100;
  localparam charJ = 8'b00001110;
  localparam charL = 8'b00111000;
  localparam charN = 8'b01010100;
  localparam charO = 8'b01011100;
  localparam charP = 8'b01110011;
  localparam charR = 8'b01010000;
  localparam charS = 8'b01101101;
  localparam charU = 8'b00111110;
  localparam charY = 8'b01101110;

  // DO NOT MODIFY ABOVE

  /**************************************************************
                   Intermediate port declarations
  **************************************************************/
  reg [3:0] div = 0;
  reg div2 = 0;
  reg div3 = 0;
  reg [7:0] ss_countup_1 = 0;
  reg [7:0] ss_countup_2 = 0;
  reg [7:0] leftreg = 0;
  reg [7:0] rightreg = 0;
  reg [2:0] rgbled = 0;
  reg [3:0] hex_count_1 = 0;
  reg [3:0] hex_count_2 = 0;
  reg [3:0] hex_count_3 = 0;
  reg [3:0] hex_count_4 = 0;
  reg [6:0] charmap_1;
  reg [6:0] charmap_2;
  reg [6:0] charmap_3;
  reg [6:0] charmap_4;
  wire clock625;
  wire clock3125;

  /**************************************************************
                            Flip flops
  **************************************************************/
  always @(posedge hz100)
    div <= div + 1;

  always @(posedge clock625)
    div2 <= ~div2;

  always @(posedge clock3125)
    div3 <= ~div3;

  always @(posedge clock625)
  begin
    ss_countup_1 <= ss_countup_1 == 'd255 ? 'd0 : {ss_countup_1 [6:0], 1'b1};
    ss_countup_2 <= ss_countup_2 == 'd255 ? 'd0 : {1'b1, ss_countup_2 [7:1]};
    leftreg <= leftreg == 'd255 ? 'd0 : {1'b1, leftreg [7:1]};
    rightreg <= rightreg == 'd255 ? 'd0 : {rightreg [6:0], 1'b1};
  end

  always @(posedge clock625) begin
    hex_count_1 <= hex_count_1 + 1;
    hex_count_2 <= hex_count_2 + 1;
    case (hex_count_1)
      0: charmap_1 = char0;
      1: charmap_1 = char1;
      2: charmap_1 = char2;
      3: charmap_1 = char3;
      4: charmap_1 = char4;
      5: charmap_1 = char5;
      6: charmap_1 = char6;
      7: charmap_1 = char7;
      8: charmap_1 = char8;
      9: charmap_1 = char9;
      10: charmap_1 = charA;
      11: charmap_1 = charB;
      12: charmap_1 = charC;
      13: charmap_1 = charD;
      14: charmap_1 = charE;
      15: charmap_1 = charF;
    endcase

    case (hex_count_2)
      0: charmap_2 = char0;
      1: charmap_2 = char1;
      2: charmap_2 = char2;
      3: charmap_2 = char3;
      4: charmap_2 = char4;
      5: charmap_2 = char5;
      6: charmap_2 = char6;
      7: charmap_2 = char7;
      8: charmap_2 = char8;
      9: charmap_2 = char9;
      10: charmap_2 = charA;
      11: charmap_2 = charB;
      12: charmap_2 = charC;
      13: charmap_2 = charD;
      14: charmap_2 = charE;
      15: charmap_2 = charF;
    endcase
  end

  always @(posedge clock15)
    rgbled <= rgbled + 1;


  always @(posedge clock3125) begin
    hex_count_3 <= hex_count_3 + 1;
    hex_count_4 <= hex_count_4 + 1;
    case (hex_count_3)
      0: charmap_3 = char0;
      1: charmap_3 = char1;
      2: charmap_3 = char2;
      3: charmap_3 = char3;
      4: charmap_3 = char4;
      5: charmap_3 = char5;
      6: charmap_3 = char6;
      7: charmap_3 = char7;
      8: charmap_3 = char8;
      9: charmap_3 = char9;
      10: charmap_3 = charA;
      11: charmap_3 = charB;
      12: charmap_3 = charC;
      13: charmap_3 = charD;
      14: charmap_3 = charE;
      15: charmap_3 = charF;
    endcase

    case (hex_count_4)
      0: charmap_4 = char0;
      1: charmap_4 = char1;
      2: charmap_4 = char2;
      3: charmap_4 = char3;
      4: charmap_4 = char4;
      5: charmap_4 = char5;
      6: charmap_4 = char6;
      7: charmap_4 = char7;
      8: charmap_4 = char8;
      9: charmap_4 = char9;
      10: charmap_4 = charA;
      11: charmap_4 = charB;
      12: charmap_4 = charC;
      13: charmap_4 = charD;
      14: charmap_4 = charE;
      15: charmap_4 = charF;
    endcase
  end


  /**************************************************************
                          Port connections
  **************************************************************/

  assign clock625 = div == 'd7;
  assign clock3125 = div2;
  assign clock15 = div3;

  assign ss0 = charmap_1;
  assign ss2 = charmap_3;
  assign ss5 = charmap_4;
  assign ss7 = charmap_2;

  assign {red, green, blue} = rgbled;
  assign left = leftreg;
  assign right = rightreg;

  // DO NOT MODIFY BELOW

endmodule
