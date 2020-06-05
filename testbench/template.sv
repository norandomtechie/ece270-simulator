`timescale 1ns / 10ps
module basic_submission_testbench();

    /***************************************/
    // Testing signals
    string TEST_SESSION;
    integer TEST_NUMBER = 0;
    integer CLK_PERIOD = 1; //1

    integer i;
    string ssmsg;
    
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

    /***************************************/
    // Top level signals
    logic tb_hz100;
    logic [20:0] tb_pb;
    wire [7:0] tb_ss [7:0];
    wire [7:0] tb_left, tb_right;
    wire tb_red, tb_green, tb_blue;

    // Clock Generation Block

    always begin
        #(CLK_PERIOD) tb_hz100 = ~tb_hz100;
    end

    // Design-Under-Test Instantiation
    top ice40
    (
        .hz100 (tb_hz100),
        .pb (tb_pb),
        .ss7 (tb_ss[7]),
        .ss6 (tb_ss[6]),
        .ss5 (tb_ss[5]),
        .ss4 (tb_ss[4]),
        .ss3 (tb_ss[3]),
        .ss2 (tb_ss[2]),
        .ss1 (tb_ss[1]),
        .ss0 (tb_ss[0]),
        .left (tb_left),
        .right (tb_right),
        .red (tb_red),
        .green (tb_green),
        .blue (tb_blue)
    );

    /*************** Testing functions/tasks ***************/
    function [7:0] ssout (input [4:0] dec);
        begin
            case(dec)
                5'h0:    ssout = char0;
                5'h1:    ssout = char1;
                5'h2:    ssout = char2;
                5'h3:    ssout = char3;
                5'h4:    ssout = char4;
                5'h5:    ssout = char5;
                5'h6:    ssout = char6;
                5'h7:    ssout = char7;
                5'h8:    ssout = char8;
                5'h9:    ssout = char9;
                5'hA:    ssout = charA;
                5'hB:    ssout = charB;
                5'hC:    ssout = charC;
                5'hD:    ssout = charD;
                5'hE:    ssout = charE;
                5'hF:    ssout = charF;
                default: ssout = blank;
            endcase
        end
    endfunction

    function string ss_to_string (input [4:0] dec);
        begin
            case(dec)
                5'h0:    ss_to_string = "ss0";
                5'h1:    ss_to_string = "ss1";
                5'h2:    ss_to_string = "ss2";
                5'h3:    ss_to_string = "ss3";
                5'h4:    ss_to_string = "ss4";
                5'h5:    ss_to_string = "ss5";
                5'h6:    ss_to_string = "ss6";
                5'h7:    ss_to_string = "ss7";
                default: ss_to_string = "ignore";
            endcase
        end
    endfunction

    task check_output (input string msg, input logic [7:0] in, input logic [7:0] expected);
        if (in === expected)
            $display(" - Test for %s PASSED.", msg);
        else
            $display(" - Test for %s FAILED, value = %d, expected = %d.", msg, in, expected);
    endtask

    task clock;
        @(posedge tb_hz100);
    endtask

    task reset_dut;
        begin
                tb_pb [16] = 1; tb_pb [3] = 1; tb_pb [0] = 1;
            #5  tb_pb [16] = 0; tb_pb [3] = 0; tb_pb [0] = 0;
        end
    endtask
    /*************** ********************** ***************/

    initial begin
        TEST_SESSION = "{TEST_SESSION}";

        // Change the reset values accordingly.

        $display ("/******************************************************/");
        $display ("Testbench results for %s\n", TEST_SESSION);


        /*************** Power-on reset test ***************/        
        $display ("%0d. Test for power on reset", TEST_NUMBER);
        tb_hz100 = 0;
        clock;

        reset_dut;
        check_output ("initial value of red after reset", tb_red, 1'bz);
        check_output ("initial value of green after reset", tb_green, 1'bz);
        check_output ("initial value of blue after reset", tb_blue, 1'bz);
        check_output ("initial value of left after reset", tb_left, 'hZ);
        check_output ("initial value of right after reset", tb_right, 'hZ);

        for (i = 0; i <= 7; i = i + 1) begin
            check_output ({"initial value of ", ss_to_string (i), " after reset"}, tb_ss [i], 'hZ);
        end

        TEST_NUMBER = TEST_NUMBER + 1;

        /*************** Add more tests here ***************/
            
            //  Use this format for each test:

            /*************** <test_1_name> ***************  
            $display ("%0d. Test for <test_1_name>", TEST_NUMBER);
            clock;

            <test_1_stimulus>
            clock; 

            check_output ("initial value of red after reset",   tb_red,    <test_1_expected_red>);
            check_output ("initial value of green after reset", tb_green,  <test_1_expected_green>);
            check_output ("initial value of blue after reset",  tb_blue,   <test_1_expected_blue>);
            check_output ("initial value of left after reset",  tb_left,   <test_1_expected_left>);
            check_output ("initial value of right after reset", tb_right,  <test_1_expected_right>);
            check_output ("initial value of ss0 after reset",   tb_ss0,    <test_1_expected_ss0>);
            check_output ("initial value of ss1 after reset",   tb_ss1,    <test_1_expected_ss1>);
            check_output ("initial value of ss2 after reset",   tb_ss2,    <test_1_expected_ss2>);
            check_output ("initial value of ss3 after reset",   tb_ss3,    <test_1_expected_ss3>);
            check_output ("initial value of ss4 after reset",   tb_ss4,    <test_1_expected_ss4>);
            check_output ("initial value of ss5 after reset",   tb_ss5,    <test_1_expected_ss5>);
            check_output ("initial value of ss6 after reset",   tb_ss6,    <test_1_expected_ss6>);
            check_output ("initial value of ss7 after reset",   tb_ss7,    <test_1_expected_ss7>);
            
            TEST_NUMBER = TEST_NUMBER + 1;

            ****************************************/

        /** 
            Use these functions to help you test students' code.

            check_output (input string msg, input logic [7:0] in, input logic [7:0] expected);
             - Pass a message for the check to be printed, along with the actual signal and 
               expected value.
            Ex: check_output ("test for ss0 display after reset", ss0, char0);

            ssout (input [4:0] dec);
             - Pass a hexadecimal value 0-F to get the corresponding character code for the
               seven segment display.
            Ex: ssout (0) returns 8'b00111111, ssout (1) returns 8'b00000110, etc.

            clock;
             - Just waits a clock cycle. Try to use this instead of @(posedge tb_hz100)
               because you never know if we wish to use different clock speeds. This is called
               being flexible ;)
        **/

        //<PROGRAMMATIC_TEST_INSERTION>//

        $display ("\n/******************************************************/");
        $finish;
    end

endmodule