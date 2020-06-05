`timescale 1ns / 10ps
module tb_struct_ice40 ();

/***********************************
            Module wires
************************************/
wire tb_i_hz100;
wire [20:0] tb_i_pb;

wire tb_o_ss7_0; wire tb_o_ss7_1; wire tb_o_ss7_2; wire tb_o_ss7_3; wire tb_o_ss7_4; wire tb_o_ss7_5; wire tb_o_ss7_6; wire tb_o_ss7_7; 
wire tb_o_ss6_0; wire tb_o_ss6_1; wire tb_o_ss6_2; wire tb_o_ss6_3; wire tb_o_ss6_4; wire tb_o_ss6_5; wire tb_o_ss6_6; wire tb_o_ss6_7; 
wire tb_o_ss5_0; wire tb_o_ss5_1; wire tb_o_ss5_2; wire tb_o_ss5_3; wire tb_o_ss5_4; wire tb_o_ss5_5; wire tb_o_ss5_6; wire tb_o_ss5_7; 
wire tb_o_ss4_0; wire tb_o_ss4_1; wire tb_o_ss4_2; wire tb_o_ss4_3; wire tb_o_ss4_4; wire tb_o_ss4_5; wire tb_o_ss4_6; wire tb_o_ss4_7; 
wire tb_o_ss3_0; wire tb_o_ss3_1; wire tb_o_ss3_2; wire tb_o_ss3_3; wire tb_o_ss3_4; wire tb_o_ss3_5; wire tb_o_ss3_6; wire tb_o_ss3_7; 
wire tb_o_ss2_0; wire tb_o_ss2_1; wire tb_o_ss2_2; wire tb_o_ss2_3; wire tb_o_ss2_4; wire tb_o_ss2_5; wire tb_o_ss2_6; wire tb_o_ss2_7; 
wire tb_o_ss1_0; wire tb_o_ss1_1; wire tb_o_ss1_2; wire tb_o_ss1_3; wire tb_o_ss1_4; wire tb_o_ss1_5; wire tb_o_ss1_6; wire tb_o_ss1_7; 
wire tb_o_ss0_0; wire tb_o_ss0_1; wire tb_o_ss0_2; wire tb_o_ss0_3; wire tb_o_ss0_4; wire tb_o_ss0_5; wire tb_o_ss0_6; wire tb_o_ss0_7; 

wire tb_o_left_0; wire tb_o_left_1; wire tb_o_left_2; wire tb_o_left_3; wire tb_o_left_4; wire tb_o_left_5; wire tb_o_left_6; wire tb_o_left_7;

wire tb_o_right_0; wire tb_o_right_1; wire tb_o_right_2; wire tb_o_right_3; wire tb_o_right_4; wire tb_o_right_5; wire tb_o_right_6; wire tb_o_right_7;

wire tb_o_red; wire tb_o_green; wire tb_o_blue;

wire tb_reset;

/***********************************
            CVC reg's
************************************/
reg tb_i_hz100_reg;
reg [20:0] tb_i_pb_reg;
reg [7:0] tb_o_ss7_reg;
reg [7:0] tb_o_ss6_reg;
reg [7:0] tb_o_ss5_reg;
reg [7:0] tb_o_ss4_reg;
reg [7:0] tb_o_ss3_reg;
reg [7:0] tb_o_ss2_reg;
reg [7:0] tb_o_ss1_reg;
reg [7:0] tb_o_ss0_reg;
reg [7:0] tb_o_left_reg;
reg [7:0] tb_o_right_reg;
reg tb_o_red_reg;
reg tb_o_green_reg;
reg tb_o_blue_reg;

/**********************************************************************
          Set up DPI connection and initial value for clock
***********************************************************************/

export "DPI-C" task svdpi_read;
// export "DPI-C" task svdpi_write;
import "DPI-C" function int return_input (input int a);
import "DPI-C" task in_read;
import "DPI-C" task svdpi_setup;
import "DPI-C" task timer_watch;
import "DPI-C" task out_write (input int p_ss7,  input int p_ss6,   input int p_ss5, input int p_ss4, 
                               input int p_ss3,  input int p_ss2,   input int p_ss1, input int p_ss0,
                               input int p_left, input int p_right, input int p_red, input int p_green,
                               input int p_blue);

task svdpi_read (input int pb, input int hz100);
  tb_i_pb_reg = return_input (0);
  tb_i_hz100_reg = return_input (1);
endtask

initial begin
  svdpi_setup;
end

always begin
  #1  in_read;
      out_write (tb_o_ss7, tb_o_ss6, tb_o_ss5, tb_o_ss4, tb_o_ss3, tb_o_ss2, tb_o_ss1, tb_o_ss0, 
                  tb_o_left, tb_o_right, tb_o_red, tb_o_green, tb_o_blue, 0, 0);
      timer_watch;
end


/**********************************************************************
                          Connect inputs to DPI
***********************************************************************/
assign tb_i_hz100 = tb_i_hz100_reg;
assign tb_i_pb = tb_i_pb_reg;

/**********************************************************************
                      Instantiate student module
***********************************************************************/
reset_on_start ros 
(
  .reset (tb_reset), 
  .clk (tb_i_hz100),
  .manual (tb_i_pb[0] && tb_i_pb[3] && tb_i_pb[16])
);

top ice40
(
  .hz100 (tb_i_hz100),
  .reset (tb_reset),
  .\pb[0] (tb_i_pb[0]),
  .\pb[1] (tb_i_pb[1]),
  .\pb[2] (tb_i_pb[2]),
  .\pb[3] (tb_i_pb[3]),
  .\pb[4] (tb_i_pb[4]),
  .\pb[5] (tb_i_pb[5]),
  .\pb[6] (tb_i_pb[6]),
  .\pb[7] (tb_i_pb[7]),
  .\pb[8] (tb_i_pb[8]),
  .\pb[9] (tb_i_pb[9]),
  .\pb[10] (tb_i_pb[10]),
  .\pb[11] (tb_i_pb[11]),
  .\pb[12] (tb_i_pb[12]),
  .\pb[13] (tb_i_pb[13]),
  .\pb[14] (tb_i_pb[14]),
  .\pb[15] (tb_i_pb[15]),
  .\pb[16] (tb_i_pb[16]),
  .\pb[17] (tb_i_pb[17]),
  .\pb[18] (tb_i_pb[18]),
  .\pb[19] (tb_i_pb[19]),
  .\pb[20] (tb_i_pb[20]),
  .\ss0[0] (tb_o_ss0_0),
  .\ss0[1] (tb_o_ss0_1),
  .\ss0[2] (tb_o_ss0_2),
  .\ss0[3] (tb_o_ss0_3),
  .\ss0[4] (tb_o_ss0_4),
  .\ss0[5] (tb_o_ss0_5),
  .\ss0[6] (tb_o_ss0_6),
  .\ss0[7] (tb_o_ss0_7),
  .\ss1[0] (tb_o_ss1_0),
  .\ss1[1] (tb_o_ss1_1),
  .\ss1[2] (tb_o_ss1_2),
  .\ss1[3] (tb_o_ss1_3),
  .\ss1[4] (tb_o_ss1_4),
  .\ss1[5] (tb_o_ss1_5),
  .\ss1[6] (tb_o_ss1_6),
  .\ss1[7] (tb_o_ss1_7),
  .\ss2[0] (tb_o_ss2_0),
  .\ss2[1] (tb_o_ss2_1),
  .\ss2[2] (tb_o_ss2_2),
  .\ss2[3] (tb_o_ss2_3),
  .\ss2[4] (tb_o_ss2_4),
  .\ss2[5] (tb_o_ss2_5),
  .\ss2[6] (tb_o_ss2_6),
  .\ss2[7] (tb_o_ss2_7),
  .\ss3[0] (tb_o_ss3_0),
  .\ss3[1] (tb_o_ss3_1),
  .\ss3[2] (tb_o_ss3_2),
  .\ss3[3] (tb_o_ss3_3),
  .\ss3[4] (tb_o_ss3_4),
  .\ss3[5] (tb_o_ss3_5),
  .\ss3[6] (tb_o_ss3_6),
  .\ss3[7] (tb_o_ss3_7),
  .\ss4[0] (tb_o_ss4_0),
  .\ss4[1] (tb_o_ss4_1),
  .\ss4[2] (tb_o_ss4_2),
  .\ss4[3] (tb_o_ss4_3),
  .\ss4[4] (tb_o_ss4_4),
  .\ss4[5] (tb_o_ss4_5),
  .\ss4[6] (tb_o_ss4_6),
  .\ss4[7] (tb_o_ss4_7),
  .\ss5[0] (tb_o_ss5_0),
  .\ss5[1] (tb_o_ss5_1),
  .\ss5[2] (tb_o_ss5_2),
  .\ss5[3] (tb_o_ss5_3),
  .\ss5[4] (tb_o_ss5_4),
  .\ss5[5] (tb_o_ss5_5),
  .\ss5[6] (tb_o_ss5_6),
  .\ss5[7] (tb_o_ss5_7),
  .\ss6[0] (tb_o_ss6_0),
  .\ss6[1] (tb_o_ss6_1),
  .\ss6[2] (tb_o_ss6_2),
  .\ss6[3] (tb_o_ss6_3),
  .\ss6[4] (tb_o_ss6_4),
  .\ss6[5] (tb_o_ss6_5),
  .\ss6[6] (tb_o_ss6_6),
  .\ss6[7] (tb_o_ss6_7),
  .\ss7[0] (tb_o_ss7_0),
  .\ss7[1] (tb_o_ss7_1),
  .\ss7[2] (tb_o_ss7_2),
  .\ss7[3] (tb_o_ss7_3),
  .\ss7[4] (tb_o_ss7_4),
  .\ss7[5] (tb_o_ss7_5),
  .\ss7[6] (tb_o_ss7_6),
  .\ss7[7] (tb_o_ss7_7),
  .\left[0] (tb_o_left_0),
  .\left[1] (tb_o_left_1),
  .\left[2] (tb_o_left_2),
  .\left[3] (tb_o_left_3),
  .\left[4] (tb_o_left_4),
  .\left[5] (tb_o_left_5),
  .\left[6] (tb_o_left_6),
  .\left[7] (tb_o_left_7),
  .\right[0] (tb_o_right_0),
  .\right[1] (tb_o_right_1),
  .\right[2] (tb_o_right_2),
  .\right[3] (tb_o_right_3),
  .\right[4] (tb_o_right_4),
  .\right[5] (tb_o_right_5),
  .\right[6] (tb_o_right_6),
  .\right[7] (tb_o_right_7),
  .red (tb_o_red),
  .green (tb_o_green),
  .blue (tb_o_blue)
);

/**********************************************************************
                          Connect myhdl to outputs
***********************************************************************/

wire [7:0] tb_o_ss7;
assign tb_o_ss7 = {tb_o_ss7_7 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss7_6 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss7_5 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss7_4 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss7_3 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss7_2 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss7_1 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss7_0 === 1'b1 ? 1'b1 : 1'b0};
wire [7:0] tb_o_ss6;
assign tb_o_ss6 = {tb_o_ss6_7 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss6_6 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss6_5 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss6_4 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss6_3 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss6_2 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss6_1 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss6_0 === 1'b1 ? 1'b1 : 1'b0};
wire [7:0] tb_o_ss5;
assign tb_o_ss5 = {tb_o_ss5_7 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss5_6 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss5_5 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss5_4 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss5_3 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss5_2 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss5_1 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss5_0 === 1'b1 ? 1'b1 : 1'b0};
wire [7:0] tb_o_ss4;
assign tb_o_ss4 = {tb_o_ss4_7 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss4_6 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss4_5 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss4_4 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss4_3 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss4_2 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss4_1 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss4_0 === 1'b1 ? 1'b1 : 1'b0};
wire [7:0] tb_o_ss3;
assign tb_o_ss3 = {tb_o_ss3_7 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss3_6 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss3_5 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss3_4 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss3_3 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss3_2 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss3_1 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss3_0 === 1'b1 ? 1'b1 : 1'b0};
wire [7:0] tb_o_ss2;
assign tb_o_ss2 = {tb_o_ss2_7 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss2_6 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss2_5 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss2_4 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss2_3 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss2_2 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss2_1 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss2_0 === 1'b1 ? 1'b1 : 1'b0};
wire [7:0] tb_o_ss1;
assign tb_o_ss1 = {tb_o_ss1_7 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss1_6 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss1_5 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss1_4 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss1_3 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss1_2 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss1_1 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss1_0 === 1'b1 ? 1'b1 : 1'b0};
wire [7:0] tb_o_ss0;
assign tb_o_ss0 = {tb_o_ss0_7 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss0_6 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss0_5 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss0_4 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss0_3 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss0_2 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss0_1 === 1'b1 ? 1'b1 : 1'b0, tb_o_ss0_0 === 1'b1 ? 1'b1 : 1'b0};
wire [7:0] tb_o_left;
assign tb_o_left = {tb_o_left_7 === 1'b1 ? 1'b1 : 1'b0, tb_o_left_6 === 1'b1 ? 1'b1 : 1'b0, tb_o_left_5 === 1'b1 ? 1'b1 : 1'b0, tb_o_left_4 === 1'b1 ? 1'b1 : 1'b0, tb_o_left_3 === 1'b1 ? 1'b1 : 1'b0, tb_o_left_2 === 1'b1 ? 1'b1 : 1'b0, tb_o_left_1 === 1'b1 ? 1'b1 : 1'b0, tb_o_left_0 === 1'b1 ? 1'b1 : 1'b0};
wire [7:0] tb_o_right;
assign tb_o_right = {tb_o_right_7 === 1'b1 ? 1'b1 : 1'b0, tb_o_right_6 === 1'b1 ? 1'b1 : 1'b0, tb_o_right_5 === 1'b1 ? 1'b1 : 1'b0, tb_o_right_4 === 1'b1 ? 1'b1 : 1'b0, tb_o_right_3 === 1'b1 ? 1'b1 : 1'b0, tb_o_right_2 === 1'b1 ? 1'b1 : 1'b0, tb_o_right_1 === 1'b1 ? 1'b1 : 1'b0, tb_o_right_0 === 1'b1 ? 1'b1 : 1'b0};

always @(*) begin
    tb_o_ss7_reg = tb_o_ss7;
    tb_o_ss6_reg = tb_o_ss6;
    tb_o_ss5_reg = tb_o_ss5;
    tb_o_ss4_reg = tb_o_ss4;
    tb_o_ss3_reg = tb_o_ss3;
    tb_o_ss2_reg = tb_o_ss2;
    tb_o_ss1_reg = tb_o_ss1;
    tb_o_ss0_reg = tb_o_ss0;
    tb_o_left_reg = tb_o_left;
    tb_o_right_reg = tb_o_right;
    tb_o_red_reg = tb_o_red;
    tb_o_green_reg = tb_o_green;
    tb_o_blue_reg = tb_o_blue;
end

endmodule
