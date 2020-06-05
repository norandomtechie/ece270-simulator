`timescale 1ns / 10ps
module tb_ice40();

/***********************************
            Module wires
************************************/
wire tb_i_hz100;
wire [20:0] tb_i_pb;
wire [7:0] tb_i_rxdata;
wire tb_i_txready;
wire tb_i_rxready;

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

wire tb_o_txdata_0; wire tb_o_txdata_1; wire tb_o_txdata_2; wire tb_o_txdata_3; wire tb_o_txdata_4; wire tb_o_txdata_5; wire tb_o_txdata_6; wire tb_o_txdata_7;
wire txclk; wire rxclk;

/***********************************
            CVC reg's
************************************/
reg tb_i_hz100_reg;
reg [20:0] tb_i_pb_reg;
reg tb_i_txready_reg;
reg tb_i_rxready_reg;
reg [7:0] tb_i_rxdata_reg;

/**********************************************************************
          Set up DPI connection and initial value for clock
***********************************************************************/

export "DPI-C" task svdpi_read;
// export "DPI-C" task svdpi_write;
import "DPI-C" function int return_input (input int a);
import "DPI-C" task in_process_and_read;
import "DPI-C" task svdpi_setup;
import "DPI-C" task timer_watch;
import "DPI-C" task out_write (input int p_ss7,  input int p_ss6,   input int p_ss5,   input int p_ss4, 
                               input int p_ss3,  input int p_ss2,   input int p_ss1,   input int p_ss0,
                               input int p_left, input int p_right, input int p_red,   input int p_green,
                               input int p_blue, input int p_txclk, input int p_rxclk, input int p_rxdata);

task svdpi_read ();
  tb_i_hz100_reg = return_input (0);
  tb_i_pb_reg = return_input (1);
  tb_i_rxdata_reg = return_input (2);
  tb_i_rxready_reg = return_input (3);
  tb_i_txready_reg = return_input (4);
endtask

initial begin
  svdpi_setup;
end

always begin
  #1  in_process_and_read;
      out_write (tb_o_ss7, tb_o_ss6, tb_o_ss5, tb_o_ss4, tb_o_ss3, tb_o_ss2, tb_o_ss1, tb_o_ss0, 
                  tb_o_left, tb_o_right, tb_o_red, tb_o_green, tb_o_blue, tb_o_txclk, tb_o_rxclk, tb_o_txdata);
      timer_watch;
end


/**********************************************************************
                          Connect inputs to DPI
***********************************************************************/
assign tb_i_hz100 = tb_i_hz100_reg;
assign tb_i_pb = tb_i_pb_reg;
assign tb_i_txready = tb_i_txready_reg;
assign tb_i_rxready = tb_i_rxready_reg;
assign tb_i_rxdata = tb_i_rxdata_reg;

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
  .pb (tb_i_pb),
  .txready (tb_i_txready),
  .rxready (tb_i_rxready),
  .rxdata (tb_i_rxdata),
  .ss7 ({tb_o_ss7_7, tb_o_ss7_6, tb_o_ss7_5, tb_o_ss7_4, tb_o_ss7_3, tb_o_ss7_2, tb_o_ss7_1, tb_o_ss7_0}),
  .ss6 ({tb_o_ss6_7, tb_o_ss6_6, tb_o_ss6_5, tb_o_ss6_4, tb_o_ss6_3, tb_o_ss6_2, tb_o_ss6_1, tb_o_ss6_0}),
  .ss5 ({tb_o_ss5_7, tb_o_ss5_6, tb_o_ss5_5, tb_o_ss5_4, tb_o_ss5_3, tb_o_ss5_2, tb_o_ss5_1, tb_o_ss5_0}),
  .ss4 ({tb_o_ss4_7, tb_o_ss4_6, tb_o_ss4_5, tb_o_ss4_4, tb_o_ss4_3, tb_o_ss4_2, tb_o_ss4_1, tb_o_ss4_0}),
  .ss3 ({tb_o_ss3_7, tb_o_ss3_6, tb_o_ss3_5, tb_o_ss3_4, tb_o_ss3_3, tb_o_ss3_2, tb_o_ss3_1, tb_o_ss3_0}),
  .ss2 ({tb_o_ss2_7, tb_o_ss2_6, tb_o_ss2_5, tb_o_ss2_4, tb_o_ss2_3, tb_o_ss2_2, tb_o_ss2_1, tb_o_ss2_0}),
  .ss1 ({tb_o_ss1_7, tb_o_ss1_6, tb_o_ss1_5, tb_o_ss1_4, tb_o_ss1_3, tb_o_ss1_2, tb_o_ss1_1, tb_o_ss1_0}),
  .ss0 ({tb_o_ss0_7, tb_o_ss0_6, tb_o_ss0_5, tb_o_ss0_4, tb_o_ss0_3, tb_o_ss0_2, tb_o_ss0_1, tb_o_ss0_0}),
  .left ({tb_o_left_7, tb_o_left_6, tb_o_left_5, tb_o_left_4, tb_o_left_3, tb_o_left_2, tb_o_left_1, tb_o_left_0}),
  .right ({tb_o_right_7, tb_o_right_6, tb_o_right_5, tb_o_right_4, tb_o_right_3, tb_o_right_2, tb_o_right_1, tb_o_right_0}),
  .red (tb_o_red),
  .green (tb_o_green),
  .blue (tb_o_blue),
  .txclk (tb_o_txclk),
  .rxclk (tb_o_rxclk),
  .txdata (tb_o_txdata)
);

/**********************************************************************
                          Connect myhdl to outputs
***********************************************************************/

wire [7:0] tb_o_ss7;
assign tb_o_ss7 = { 
                    tb_o_ss7_7 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss7_6 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss7_5 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss7_4 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss7_3 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss7_2 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss7_1 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss7_0 === 1'b1 ? 1'b1 : 1'b0
                   };
wire [7:0] tb_o_ss6;
assign tb_o_ss6 = { 
                    tb_o_ss6_7 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss6_6 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss6_5 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss6_4 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss6_3 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss6_2 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss6_1 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss6_0 === 1'b1 ? 1'b1 : 1'b0
                   };
wire [7:0] tb_o_ss5;
assign tb_o_ss5 = { 
                    tb_o_ss5_7 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss5_6 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss5_5 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss5_4 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss5_3 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss5_2 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss5_1 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss5_0 === 1'b1 ? 1'b1 : 1'b0
                   };
wire [7:0] tb_o_ss4;
assign tb_o_ss4 = { 
                    tb_o_ss4_7 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss4_6 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss4_5 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss4_4 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss4_3 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss4_2 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss4_1 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss4_0 === 1'b1 ? 1'b1 : 1'b0
                   };
wire [7:0] tb_o_ss3;
assign tb_o_ss3 = { 
                    tb_o_ss3_7 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss3_6 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss3_5 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss3_4 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss3_3 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss3_2 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss3_1 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss3_0 === 1'b1 ? 1'b1 : 1'b0
                   };
wire [7:0] tb_o_ss2;
assign tb_o_ss2 = { 
                    tb_o_ss2_7 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss2_6 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss2_5 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss2_4 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss2_3 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss2_2 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss2_1 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss2_0 === 1'b1 ? 1'b1 : 1'b0
                   };
wire [7:0] tb_o_ss1;
assign tb_o_ss1 = { 
                    tb_o_ss1_7 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss1_6 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss1_5 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss1_4 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss1_3 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss1_2 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss1_1 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss1_0 === 1'b1 ? 1'b1 : 1'b0
                   };
wire [7:0] tb_o_ss0;
assign tb_o_ss0 = { 
                    tb_o_ss0_7 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss0_6 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss0_5 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss0_4 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss0_3 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss0_2 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss0_1 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_ss0_0 === 1'b1 ? 1'b1 : 1'b0
                   };
wire [7:0] tb_o_left;
assign tb_o_left = { 
                    tb_o_left_7 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_left_6 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_left_5 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_left_4 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_left_3 === 1'b1 ? 1'b1 : 1'b0,
                    tb_o_left_2 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_left_1 === 1'b1 ? 1'b1 : 1'b0, 
                    tb_o_left_0 === 1'b1 ? 1'b1 : 1'b0
                   };
wire [7:0] tb_o_right;
assign tb_o_right = {
                      tb_o_right_7 === 1'b1 ? 1'b1 : 1'b0, 
                      tb_o_right_6 === 1'b1 ? 1'b1 : 1'b0, 
                      tb_o_right_5 === 1'b1 ? 1'b1 : 1'b0, 
                      tb_o_right_4 === 1'b1 ? 1'b1 : 1'b0, 
                      tb_o_right_3 === 1'b1 ? 1'b1 : 1'b0, 
                      tb_o_right_2 === 1'b1 ? 1'b1 : 1'b0, 
                      tb_o_right_1 === 1'b1 ? 1'b1 : 1'b0, 
                      tb_o_right_0 === 1'b1 ? 1'b1 : 1'b0
                    };

endmodule
