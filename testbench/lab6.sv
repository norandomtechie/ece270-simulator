`timescale 1ns / 10ps
module testbench_lab6();

    /***************************************/
    // Testing signals
    string TEST_SESSION;
    integer TEST_NUMBER = 0;
    real TEST_SCORE = 0;
    integer CLK_PERIOD = 1; 
    real PER_TEST_SCORE = 6.25;

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
    wire tb_reset;
    assign tb_reset = tb_pb[3] && tb_pb[0] && tb_pb[16];

    // Clock Generation Block

    always begin
        #(CLK_PERIOD) tb_hz100 = ~tb_hz100;
    end

    // Design-Under-Test Instantiation
    top ice40
    (
        .hz100 (tb_hz100), 
        .reset (tb_reset),
        .\pb[0] (tb_pb[0]),
        .\pb[1] (tb_pb[1]),
        .\pb[2] (tb_pb[2]),
        .\pb[3] (tb_pb[3]),
        .\pb[4] (tb_pb[4]),
        .\pb[5] (tb_pb[5]),
        .\pb[6] (tb_pb[6]),
        .\pb[7] (tb_pb[7]),
        .\pb[8] (tb_pb[8]),
        .\pb[9] (tb_pb[9]),
        .\pb[10] (tb_pb[10]),
        .\pb[11] (tb_pb[11]),
        .\pb[12] (tb_pb[12]),
        .\pb[13] (tb_pb[13]),
        .\pb[14] (tb_pb[14]),
        .\pb[15] (tb_pb[15]),
        .\pb[16] (tb_pb[16]),
        .\pb[17] (tb_pb[17]),
        .\pb[18] (tb_pb[18]),
        .\pb[19] (tb_pb[19]),
        .\pb[20] (tb_pb[20]),
        .\ss7[0] (tb_ss[7][0]),
        .\ss7[1] (tb_ss[7][1]),
        .\ss7[2] (tb_ss[7][2]),
        .\ss7[3] (tb_ss[7][3]),
        .\ss7[4] (tb_ss[7][4]),
        .\ss7[5] (tb_ss[7][5]),
        .\ss7[6] (tb_ss[7][6]),
        .\ss7[7] (tb_ss[7][7]),
        .\ss6[0] (tb_ss[6][0]),
        .\ss6[1] (tb_ss[6][1]),
        .\ss6[2] (tb_ss[6][2]),
        .\ss6[3] (tb_ss[6][3]),
        .\ss6[4] (tb_ss[6][4]),
        .\ss6[5] (tb_ss[6][5]),
        .\ss6[6] (tb_ss[6][6]),
        .\ss6[7] (tb_ss[6][7]),
        .\ss5[0] (tb_ss[5][0]),
        .\ss5[1] (tb_ss[5][1]),
        .\ss5[2] (tb_ss[5][2]),
        .\ss5[3] (tb_ss[5][3]),
        .\ss5[4] (tb_ss[5][4]),
        .\ss5[5] (tb_ss[5][5]),
        .\ss5[6] (tb_ss[5][6]),
        .\ss5[7] (tb_ss[5][7]),
        .\ss4[0] (tb_ss[4][0]),
        .\ss4[1] (tb_ss[4][1]),
        .\ss4[2] (tb_ss[4][2]),
        .\ss4[3] (tb_ss[4][3]),
        .\ss4[4] (tb_ss[4][4]),
        .\ss4[5] (tb_ss[4][5]),
        .\ss4[6] (tb_ss[4][6]),
        .\ss4[7] (tb_ss[4][7]),
        .\ss3[0] (tb_ss[3][0]),
        .\ss3[1] (tb_ss[3][1]),
        .\ss3[2] (tb_ss[3][2]),
        .\ss3[3] (tb_ss[3][3]),
        .\ss3[4] (tb_ss[3][4]),
        .\ss3[5] (tb_ss[3][5]),
        .\ss3[6] (tb_ss[3][6]),
        .\ss3[7] (tb_ss[3][7]),
        .\ss2[0] (tb_ss[2][0]),
        .\ss2[1] (tb_ss[2][1]),
        .\ss2[2] (tb_ss[2][2]),
        .\ss2[3] (tb_ss[2][3]),
        .\ss2[4] (tb_ss[2][4]),
        .\ss2[5] (tb_ss[2][5]),
        .\ss2[6] (tb_ss[2][6]),
        .\ss2[7] (tb_ss[2][7]),
        .\ss1[0] (tb_ss[1][0]),
        .\ss1[1] (tb_ss[1][1]),
        .\ss1[2] (tb_ss[1][2]),
        .\ss1[3] (tb_ss[1][3]),
        .\ss1[4] (tb_ss[1][4]),
        .\ss1[5] (tb_ss[1][5]),
        .\ss1[6] (tb_ss[1][6]),
        .\ss1[7] (tb_ss[1][7]),
        .\ss0[0] (tb_ss[0][0]),
        .\ss0[1] (tb_ss[0][1]),
        .\ss0[2] (tb_ss[0][2]),
        .\ss0[3] (tb_ss[0][3]),
        .\ss0[4] (tb_ss[0][4]),
        .\ss0[5] (tb_ss[0][5]),
        .\ss0[6] (tb_ss[0][6]),
        .\ss0[7] (tb_ss[0][7]),
        .\left[0] (tb_left[0]),
        .\left[1] (tb_left[1]),
        .\left[2] (tb_left[2]),
        .\left[3] (tb_left[3]),
        .\left[4] (tb_left[4]),
        .\left[5] (tb_left[5]),
        .\left[6] (tb_left[6]),
        .\left[7] (tb_left[7]),
        .\right[0] (tb_right[0]),
        .\right[1] (tb_right[1]),
        .\right[2] (tb_right[2]),
        .\right[3] (tb_right[3]),
        .\right[4] (tb_right[4]),
        .\right[5] (tb_right[5]),
        .\right[6] (tb_right[6]),
        .\right[7] (tb_right[7]),
        .red (tb_red),
        .green (tb_green),
        .blue (tb_blue)
    );

    // Struct-to-source mapping


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
        if (in [6:0] === expected [6:0]) begin
            $display("/./ - Test for %s PASSED.", msg);
            TEST_SCORE += PER_TEST_SCORE;
        end
        else
            $display("/./ - Test for %s FAILED, value = %b, expected = %b.", msg, in, expected);
    endtask

    task reset_dut;
        begin
                tb_pb [16] = 1; tb_pb [3] = 1; tb_pb [0] = 1;
            #5  tb_pb [16] = 0; tb_pb [3] = 0; tb_pb [0] = 0;
        end
    endtask

    task assert_binary (input logic [3:0] bin);
        begin
            tb_pb [3:0] = bin;
        end
    endtask

    task assert_reverse_binary (input logic [3:0] bin);
        begin
            tb_pb [3:0] = {bin[0], bin[1], bin[2], bin[3]};
        end
    endtask

    task lab6_test_regular;
        begin
            #1 check_output ("initial value of ss0 with assertion of 1 in binary", tb_ss [0], 8'b?0000110); // 1

            #1 assert_binary (4'd2);
            #1 check_output ("initial value of ss0 with assertion of 2 in binary", tb_ss [0], 8'b?1011011); // 2

            #1 assert_binary (4'd3);
            #1 check_output ("initial value of ss0 with assertion of 3 in binary", tb_ss [0], 8'b?1001111); // 3

            #1 assert_binary (4'd4);
            #1 check_output ("initial value of ss0 with assertion of 4 in binary", tb_ss [0], 8'b?1100110); // 4

            #1 assert_binary (4'd5);
            #1 check_output ("initial value of ss0 with assertion of 5 in binary", tb_ss [0], 8'b?1101101); // 5

            #1 assert_binary (4'd6);
            #1 check_output ("initial value of ss0 with assertion of 6 in binary", tb_ss [0], 8'b?1111101); // 6

            #1 assert_binary (4'd7);
            #1 check_output ("initial value of ss0 with assertion of 7 in binary", tb_ss [0], 8'b?0000111); // 7

            #1 assert_binary (4'h8);
            #1 check_output ("initial value of ss0 with assertion of 8 in binary", tb_ss [0], 8'b?1111111); // 8

            #1 assert_binary (4'h9);
            #1 check_output ("initial value of ss0 with assertion of 9 in binary", tb_ss [0], 8'b?1101111); // 9

            #1 assert_binary (4'ha);
            #1 check_output ("initial value of ss0 with assertion of A in binary", tb_ss [0], 8'b?1110111); // a

            #1 assert_binary (4'hb);
            #1 check_output ("initial value of ss0 with assertion of B in binary", tb_ss [0], 8'b?1111100); // b

            #1 assert_binary (4'hc);
            #1 check_output ("initial value of ss0 with assertion of C in binary", tb_ss [0], 8'b?0111001); // c

            #1 assert_binary (4'hd);
            #1 check_output ("initial value of ss0 with assertion of D in binary", tb_ss [0], 8'b?1011110); // d

            #1 assert_binary (4'he);
            #1 check_output ("initial value of ss0 with assertion of E in binary", tb_ss [0], 8'b?1111001); // e

            #1 assert_binary (4'hf);
            #1 check_output ("initial value of ss0 with assertion of F in binary", tb_ss [0], 8'b?1110001); // f
        end
    endtask

    task lab6_test_inverted;
        begin
            #1 assert_reverse_binary (4'd1);
            #1 check_output ("initial value of ss0 with inverse assertion of 1 in binary", tb_ss [0], 8'b?0000110); // 1

            #1 assert_reverse_binary (4'd2);
            #1 check_output ("initial value of ss0 with inverse assertion of 2 in binary", tb_ss [0], 8'b?1011011); // 2

            #1 assert_reverse_binary (4'd3);
            #1 check_output ("initial value of ss0 with inverse assertion of 3 in binary", tb_ss [0], 8'b?1001111); // 3

            #1 assert_reverse_binary (4'd4);
            #1 check_output ("initial value of ss0 with inverse assertion of 4 in binary", tb_ss [0], 8'b?1100110); // 4

            #1 assert_reverse_binary (4'd5);
            #1 check_output ("initial value of ss0 with inverse assertion of 5 in binary", tb_ss [0], 8'b?1101101); // 5

            #1 assert_reverse_binary (4'd6);
            #1 check_output ("initial value of ss0 with inverse assertion of 6 in binary", tb_ss [0], 8'b?1111101); // 6

            #1 assert_reverse_binary (4'd7);
            #1 check_output ("initial value of ss0 with inverse assertion of 7 in binary", tb_ss [0], 8'b?0000111); // 7

            #1 assert_reverse_binary (4'h8);
            #1 check_output ("initial value of ss0 with inverse assertion of 8 in binary", tb_ss [0], 8'b?1111111); // 8

            #1 assert_reverse_binary (4'h9);
            #1 check_output ("initial value of ss0 with inverse assertion of 9 in binary", tb_ss [0], 8'b?1101111); // 9

            #1 assert_reverse_binary (4'ha);
            #1 check_output ("initial value of ss0 with inverse assertion of A in binary", tb_ss [0], 8'b?1110111); // a

            #1 assert_reverse_binary (4'hb);
            #1 check_output ("initial value of ss0 with inverse assertion of B in binary", tb_ss [0], 8'b?1111100); // b

            #1 assert_reverse_binary (4'hc);
            #1 check_output ("initial value of ss0 with inverse assertion of C in binary", tb_ss [0], 8'b?0111001); // c

            #1 assert_reverse_binary (4'hd);
            #1 check_output ("initial value of ss0 with inverse assertion of D in binary", tb_ss [0], 8'b?1011110); // d

            #1 assert_reverse_binary (4'he);
            #1 check_output ("initial value of ss0 with inverse assertion of E in binary", tb_ss [0], 8'b?1111001); // e

            #1 assert_reverse_binary (4'hf);
            #1 check_output ("initial value of ss0 with inverse assertion of F in binary", tb_ss [0], 8'b?1110001); // f
        end
    endtask

    /*************** ********************** ***************/

    initial begin
        TEST_SESSION = "ECE 270 Lab 6";

        // Change the reset values accordingly.

        $display ("/./Testbench results for %s\n", TEST_SESSION);
        TEST_SCORE = 0;

        /*************** Power-on reset test ***************/        

        tb_pb = 0;
        #1 check_output ("initial value of ss0 with no assertion",             tb_ss [0], 8'b?0111111); // 0
        
        tb_pb[3:0] = 4'd1;
        #1
        if (tb_ss [0][6:0] === 7'b0000110) begin    // Binary was input as WXYZ
            lab6_test_regular;
        end
        else if (tb_ss [0][6:0] === 7'b1111111) begin // Binary was input as ZYXW
            lab6_test_inverted;
        end
        else begin
            $display ("/./Error: SS did not yield 1 or 8 upon regular assertion of 0001 on inputs. ");
            $display ("/./Value: 8'b%b; Expected 8'b%b or 8'b%b", tb_ss[0], 8'b00000110, 8'b01111111);
            $display ("/./Attempting both tests");
            lab6_test_regular;
            $display ("/./SCORE %f", TEST_SCORE);
            TEST_SCORE = 0;
            lab6_test_inverted;
        end

        $display ("/./SCORE %f", TEST_SCORE);

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

        $finish;
    end

endmodule