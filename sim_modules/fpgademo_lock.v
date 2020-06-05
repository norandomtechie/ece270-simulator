// Empty top module

module top (hz100, reset, pb, ss7, ss6, ss5, ss4, ss3, ss2, ss1, ss0, left, right, red, green, blue);
  input hz100, reset;
  input [20:0] pb;
  output [7:0] ss7, ss6, ss5, ss4, ss3, ss2, ss1, ss0, left, right;
  output red, green, blue;

  // Your code goes here...
  // prelab 1
  wire hz2;
  clock_2hz cldiv (.clk(hz100), .reset(reset), .hz2(hz2));
  // prelab 2
  wire [4:0] keycode;
  wire strobe;
  scankey sk1 (.clk(hz100), .reset(reset), .inkeys(pb[19:0]), .strobe(strobe), .outkey(keycode));
  // prelab 3
  wire [7:0] disp_en;
  display_enable_handler deh1 (.clk(strobe), .reset(reset), .keycode(keycode), .enable_out(disp_en));
  // prelab 4
  wire [1:0] state;
  dcl_controller dcl1 (.clk(strobe), .reset(reset), .enable(keycode == 5'b10000), .state(state));
  
  wire [31:0] passwd_save;
  passwd p1 (.clk(strobe), .reset(reset), .keycode(keycode), 
  	  .enable(state == 0), .out(passwd_save));
  
  wire [31:0] passwd_entry;
  passwd p2 (.clk(strobe), .reset(reset), .keycode(keycode), 
             .enable(state == 1), .out(passwd_entry));
  
  //since left and right can't show more than 8 bits
  // assign left = passwd_save; 
  // assign right = passwd_entry;
  // Turn on the blue LED when 'state' is one
  assign blue = state == 1; 
  // Tell us if the values matched
  assign open  = state == 2 ? passwd_save == passwd_entry : 0; 
  assign alarm = state == 2 ? passwd_save != passwd_entry : 0;  
  // Flash red or assert green correspondingly
  assign red = alarm & hz2;
  assign green = open;

  wire [63:0] ss_status, ss_decout;
  status_display sd (state, open, alarm, ss_status);
  
  wire [31:0] ssdec_in = state == 0 ? passwd_save : passwd_entry;
  wire password_entry_enable = state != 2 && |disp_en ? 1 : 0;
  
  ssdec s0 (ssdec_in [3:0],   disp_en [0], ss_decout [7:0]);
  ssdec s1 (ssdec_in [7:4],   disp_en [1], ss_decout [15:8]);
  ssdec s2 (ssdec_in [11:8],  disp_en [2], ss_decout [23:16]);
  ssdec s3 (ssdec_in [15:12], disp_en [3], ss_decout [31:24]);
  ssdec s4 (ssdec_in [19:16], disp_en [4], ss_decout [39:32]);
  ssdec s5 (ssdec_in [23:20], disp_en [5], ss_decout [47:40]);
  ssdec s6 (ssdec_in [27:24], disp_en [6], ss_decout [55:48]);
  ssdec s7 (ssdec_in [31:28], disp_en [7], ss_decout [63:56]);
  
  assign {ss7, ss6, ss5, ss4, ss3, ss2, ss1, ss0} = password_entry_enable ? ss_decout : ss_status;

endmodule

module status_display (state, open, alarm, ss);
  input [2:0] state;
  input open, alarm;
  output [63:0] ss;
  
  wire [7:0] charS = 8'b01101101;
  wire [7:0] charE = 8'b01111001;
  wire [7:0] charC = 8'b00111001;
  wire [7:0] charU = 8'b00111110;
  wire [7:0] charR = 8'b01010000;
  wire [7:0] charO = 8'b00111111;
  wire [7:0] charP = 8'b01110011;
  wire [7:0] charN = 8'b01010100;
  wire [7:0] char9 = 8'b01101111;
  wire [7:0] char1 = 8'b00000110;
  wire [7:0] charA = 8'b01110111;
  wire [7:0] charL = 8'b00111000;
  wire [7:0] charI = 8'b00110000;
  wire [7:0] blank = 8'b00000000;
  
  assign ss = state == 1 ?          {charS, charE, charC, charU, charR, charE, blank, blank} :
              state == 2 && open ?  {charO, charP, charE, charN, blank, blank, blank, blank} :
              state == 2 && alarm ? {charC, charA, charL, charL, blank, char9, char1, char1} :
              8'b0;
  
endmodule

module passwd (clk, reset, keycode, enable, out);
  input clk, reset, enable;
  input [4:0] keycode;
  output reg [31:0] out;
  
  always @(posedge clk, posedge reset) begin
    if (reset)
      out <= 0;
    else if (enable) begin
      if (keycode == 5'b10001)
        out <= out >> 4;
      else if (!keycode[4])
        out <= out << 4 | keycode;
    end
  end
  
endmodule

module dcl_controller (clk, reset, enable, state);
  input clk, reset, enable;
  output reg [2:0] state;
  
  localparam IDLE = 0;
  localparam ENTRY = 1;
  localparam VERIFY = 2;
  
  always @(posedge clk, posedge reset)
  if (reset)
    state = IDLE;
  else if (enable) begin
    case (state)
      IDLE: state = ENTRY;
      ENTRY: state = VERIFY;
    endcase
  end
  
endmodule

module display_enable_handler (clk, reset, keycode, enable_out);
  input clk, reset;
  input [4:0] keycode;
  output reg [7:0] enable_out;
  
  always @(posedge clk, posedge reset)
    if (reset)
      enable_out <= 0;
    else if (keycode == 5'b10000)
      enable_out <= 0;
    else if (keycode == 5'b10001)
      enable_out <= {1'b0, enable_out [7:1]};
    else
      enable_out <= {enable_out[6:0], 1'b1};
endmodule

module scankey (clk, reset, inkeys, strobe, outkey);
  input clk, reset;
  input [20:0] inkeys;
  output strobe;
  output [4:0] outkey;
  
  reg [2:0] sync;
  
  always @(posedge clk, posedge reset)
  if (reset)
    sync <= 0;
  else
    sync <= sync << 1 | {2'b0, |inkeys};
  
  assign strobe = sync[2];
  assign outkey =  inkeys [17] ? 5'd17 :
                   inkeys [16] ? 5'd16 :
                   inkeys [15] ? 5'd15 :
                   inkeys [14] ? 5'd14 :
                   inkeys [13] ? 5'd13 :
                   inkeys [12] ? 5'd12 :
                   inkeys [11] ? 5'd11 :
                   inkeys [10] ? 5'd10 :
                   inkeys [9] ? 5'd9 :
                   inkeys [8] ? 5'd8 :
                   inkeys [7] ? 5'd7 :
                   inkeys [6] ? 5'd6 :
                   inkeys [5] ? 5'd5 :
                   inkeys [4] ? 5'd4 :
                   inkeys [3] ? 5'd3 :
                   inkeys [2] ? 5'd2 :
                   inkeys [1] ? 5'd1 : 4'd0;
endmodule

module ssdec (in, enable, out);
  input [3:0] in;
  input enable;
  output [7:0] out;
  
  assign out = enable ? in == 4'hF ? 8'b01110001 :
               in == 4'hE ? 8'b01111001 :
               in == 4'hD ? 8'b01011110 :
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

module clock_2hz (clk, reset, hz2);
  input clk, reset;
  output reg hz2;
  
  wire [7:0] max = 8'd24;
  reg [7:0] ctr;
  always @(posedge clk, posedge reset)
  if (reset) begin
    ctr <= 0; 
    hz2 <= 0;
  end
  else if (ctr == max) begin
    hz2 <= ~hz2;
    ctr <= 0;
  end
  else
    ctr <= ctr + 1;
  
endmodule