# could add to CFLAGS to turn on warnings if you are using gcc
WARNS=-Wall

# change path if not running test from installed directory location
INCS=-Isrc
# maybe want -O<something> and/or -g
CFLAGS= -fPIC -m64 -D_GNU_SOURCE $(INCS)
LFLAGS= -G -shared -export-dynamic -melf_x86_64
FILEPATH=src
OBJPATH=sim_modules
FILES=$(FILEPATH)/svdpi_handler.c

# change to your compiler
CC=gcc
CVC=cvc

all: run

svdpi.o: $(FILES)
	$(CC) $(CFLAGS) -c $(FILEPATH)/svdpi_handler.c -o $(FILEPATH)/svdpi.o

svdpi.so: $(FILEPATH)/svdpi.o
	$(LD) $(LFLAGS) $(FILEPATH)/svdpi.o -o $(OBJPATH)/svdpi.so

run: $(OBJPATH)/svdpi.so
	$(CVC) +interp $(OBJPATH)/tb_ice40.sv $(FILEPATH)/example.v $(OBJPATH)/reset.v -sv_lib $(OBJPATH)/svdpi.so

compile:
	$(CVC) $(OBJPATH)/tb_ice40.sv $(FILEPATH)/example.v -sv_lib $(OBJPATH)/svdpi.so -o fpga

synthesize:
	yosys -p "synth_ice40 -top top -blif temp.blif" lab13.v
	yosys -o struct_lab13.v temp.blif
	rm -f temp.blif
	cvc +interp tb_struct_lab13.sv struct_lab13.v /usr/local/bin/../share/yosys/ice40/cells_sim.v /usr/local/bin/../share/yosys/ice40/cells_map.v -sv_lib sim_modules/svdpi.so

clean:
	rm -rf *.o *.so
