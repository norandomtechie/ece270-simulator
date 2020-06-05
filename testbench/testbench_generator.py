#! /usr/bin/python3

import re

def stimulus_generator ():
    delay = 0
    def give_valid_nums (pushbutton_data):
        nums = [int (x) for x in re.findall ('([0-9]+)', pushbutton_data)]
        invalids = [x for x in nums if x > 19 or x < 0]
        for n in invalids:
            print (str (n) + " is not a valid pushbutton. Ignoring...")
            nums.remove (n)
        return nums
    stimulus = ""
    test_stim = input ("Enter pushbutton numbers that will be asserted/toggled (as 0, 1, 2, 3...): ")
    nums = give_valid_nums (test_stim)
    for n in nums:
        stimulus += "tb_pb [%d] = 1;\n" % n
    stim_tog = input ("Now enter the pushbuttons that you wish to deassert (asserted as 1 earlier, then assert 0 5 clock cycles later): ")
    tog_nums = give_valid_nums (stim_tog)
    if len (tog_nums) > 0:
        while not all ([True for x in tog_nums if x in nums]) or not all ([True for x in nums if x in tog_nums]):
            print ("ONLY enter applicable values that you already entered in the first stimulus option!")
            print ("You asked to assert the signals '" + " ".join (nums) + "'")
            stim_tog = input ("Retry: Enter the pushbuttons that you wish to toggle (already asserted, then assert 0 1 clock cycle later): ")
            tog_nums = give_valid_nums (stim_tog)
        stimulus += "clock;\n"
        for n in tog_nums:
            stimulus += "tb_pb [%d] = 0;\n" % n
    clocks = input ("Do you wish to use a button as a clock (Toggling it every 1 timestep, y/n)? ")
    if any (x for x in 'yY' if x in clocks):
        clock_num = -1
        while clock_num < 0:
            try:
                clock_num = int (input ("Enter ONE pushbutton number to be toggled: "))
            except:
                print ("Please enter a valid number!")
        time_tog = -1
        while time_tog < 0:
            try:
                time_tog = int (input ("How many times do you want it to be toggled (clock cycles)? "))
            except:
                print ("Please enter a valid number!")
        for i in range (0, time_tog):
            stimulus += "tb_pb [%d] = %d;\n" % (clock_num, 0)
            stimulus += "clock;\n"
            stimulus += "tb_pb [%d] = %d;\n" % (clock_num, 1)
            stimulus += "clock;\n"
        stimulus += "tb_pb [%d] = %d;\n\n" % (clock_num, 0)
    return stimulus


####################################################
# Test constants

find_red   =  "<test_n_expected_red>"
find_green =  "<test_n_expected_green>"
find_blue  =  "<test_n_expected_blue>"
find_left  =  "<test_n_expected_left>"
find_right =  "<test_n_expected_right>"
find_ss0   =  "<test_n_expected_ss0>"
find_ss1   =  "<test_n_expected_ss1>"
find_ss2   =  "<test_n_expected_ss2>"
find_ss3   =  "<test_n_expected_ss3>"
find_ss4   =  "<test_n_expected_ss4>"
find_ss5   =  "<test_n_expected_ss5>"
find_ss6   =  "<test_n_expected_ss6>"
find_ss7   =  "<test_n_expected_ss7>"

find_name = "<test_n_name>"
find_stimulus = "<test_n_stimulus>"

test_class = """
                /*************** <test_n_name> ***************  
                $display ("%0d. Test for <test_n_name>", TEST_NUMBER);
                clock;

                <test_n_stimulus>
                clock; 

                check_output ("initial value of red after reset",   tb_red,    <test_n_expected_red>);
                check_output ("initial value of green after reset", tb_green,  <test_n_expected_green>);
                check_output ("initial value of blue after reset",  tb_blue,   <test_n_expected_blue>);
                check_output ("initial value of left after reset",  tb_left,   <test_n_expected_left>);
                check_output ("initial value of right after reset", tb_right,  <test_n_expected_right>);
                check_output ("initial value of ss0 after reset",   tb_ss0,    <test_n_expected_ss0>);
                check_output ("initial value of ss1 after reset",   tb_ss1,    <test_n_expected_ss1>);
                check_output ("initial value of ss2 after reset",   tb_ss2,    <test_n_expected_ss2>);
                check_output ("initial value of ss3 after reset",   tb_ss3,    <test_n_expected_ss3>);
                check_output ("initial value of ss4 after reset",   tb_ss4,    <test_n_expected_ss4>);
                check_output ("initial value of ss5 after reset",   tb_ss5,    <test_n_expected_ss5>);
                check_output ("initial value of ss6 after reset",   tb_ss6,    <test_n_expected_ss6>);
                check_output ("initial value of ss7 after reset",   tb_ss7,    <test_n_expected_ss7>);
                
                TEST_NUMBER = TEST_NUMBER + 1;

                ****************************************/\n
            """

####################################################

with open ('template.sv', 'r') as file:
    data = file.read().split ('\n')

cut_top    = data.index ('        //<PROGRAMMATIC_TEST_INSERTION>//') - 1
cut_bottom = data.index ('        //<PROGRAMMATIC_TEST_INSERTION>//') + 1

                        
""" Main process """

print ("*********** ECE 270 TA Testbench Generator ***********")
print ("******* DO NOT REDISTRIBUTE WITHOUT PERMISSION *******\n")

test_total = -1;
while test_total == -1:
    try:
        test_total = int (input ("Enter number of tests to insert: "))
    except:
        print ("ERROR: Please enter a decimal number!")

for i in range (1, test_total + 1):
    test_name = input ("Enter test name: ")
    test_object = test_class.replace (find_name, "Test %d: " % i + test_name)

    test_stimulus = stimulus_generator()
    test_object = test_class.replace (find_stimulus, test_stimulus)



    test_total -= 1