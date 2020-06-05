LAB=6
CELLS_SIM=~/yosys-yosys-0.8/share/ice40/cells_sim_timing.v ~/yosys-yosys-0.8/share/ice40/cells_map_timing.v

all: test

test: lab$(LAB).v lab$(LAB).sv
	  @yosys -q -T -p "synth_ice40 -blif temp.blif; delete top; read_blif temp.blif; write_verilog struct_lab$(LAB).v" lab$(LAB).v
	  @cvc +interp -sv -q struct_lab$(LAB).v lab$(LAB).sv $(CELLS_SIM)