`timescale 1ns/1ns

module main;
    logic hz100, reset;
    logic [20:0] pb;
    logic [7:0] ss [7:0];
    logic [7:0] left, right, txdata, rxdata;
    logic red, green, blue;
    logic txclk, rxclk, txready, rxready;

    top ice40 (
        .hz100(hz100),
        .reset(reset),
        .pb(pb),
        .left(left),
        .right(right),
        .txdata(txdata),
        .rxdata(rxdata),
        .red(red),
        .green(green),
        .blue(blue),
        .txclk(txclk),
        .rxclk(rxclk),
        .txready(txready),
        .rxready(rxready),
        .ss7(ss[7]),
        .ss6(ss[6]),
        .ss5(ss[5]),
        .ss4(ss[4]),
        .ss3(ss[3]),
        .ss2(ss[2]),
        .ss1(ss[1]),
        .ss0(ss[0])
    );

    reset_on_start ros (
        .reset(reset), 
        .clk(hz100), 
        .manual(pb[3]&&pb[0]&&pb[16])
    );

    logic [31:0] recv;
    integer ctr = 0;

    always begin
        // getinput will contain pb(20), 
        // hz100,reset,rxdata,txready,rxready(12)
        // $display("hz100: %d, reset: %d, pb[0] %d, right[0] %d", hz100, reset, pb[0], right[0]);
        recv = $sendinput();
        // ignoring pb[20] for now
        pb[19:0] = recv[19:0];
        rxdata = recv[27:20];
        rxready = recv[28];
        txready = recv[29];
        hz100 = recv[30];
        #1;
        // if (pb[1]) begin
        //   for (i = 0; i < 8; i++)
        //     $write("ss[%1d] = %d, ", i, ss[i]);
        //   $write("\n");
        //   $fflush();
        // end
        $getoutput(
          {ss[7],ss[6],ss[5],ss[4]},
          {ss[3],ss[2],ss[1],ss[0]},
          {left,right,txdata,red,green,blue,txclk,rxclk}
        );
        // $wait5ms;
    end

    integer i;
endmodule

module reset_on_start(
    output logic reset,
    input logic clk,
    input logic manual
);
  logic [2:0] startup = 0;
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