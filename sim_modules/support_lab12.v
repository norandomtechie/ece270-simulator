// The support module implements an interpreter.
//
// It has three modes: (press 'Z' to switch mode)
//
//   - Input and execution of an instruction
//     . Enter an instruction and press 'W' to execute it.
//   - Register eXamination and Writing
//     . Select a register (0-F) and press 'X' to examine or 'W' to write new value.
//   - Memory eXamination and Writing
//     . Enter an address (000-fff) and press 'X' to examine or 'W' to write new value.
//

module support12 (clk, reset, in, out7, out6, out5, out4, out3, out2, out1, out0);
  input clk, reset;
  input [20:0] in;
  output [7:0] out7, out6, out5, out4, out3, out2, out1, out0;
  
  reg [31:0] entry;             // entered value
  reg [31:0] modify;            // entered modification value
  reg bignum;                   // override prompt for big num
  wire [31:0] examine;          // something we're looking at (reg or mem[addr])

  reg [1:0] mode;               // current mode of operation
  localparam MODE_INST = 2'd0;
  localparam MODE_REG  = 2'd1;
  localparam MODE_MEM  = 2'd2;
  localparam MODE_DATA = 2'd3;

  reg [1:0] numsel;             // select a number source
  localparam NUM_ENT = 2'd0;    // show the entry input
  localparam NUM_MOD = 2'd1;    // show the modify input
  localparam NUM_EXAM = 2'd2;   // show the examine output

  wire N,Z,C,V;                 // current flag values
  wire fetch1;                  // ready for fetch stage 1
  wire fetch2;                  // ready for fetch stage 2


  wire [7:0] s7, s6, s5, s4, s3, s2, s1, s0;
  wire [31:0] source = numsel==NUM_ENT ? entry :
                       numsel==NUM_MOD ? modify :
                       numsel==NUM_EXAM ? examine : 0;
  ssdec d7(.in(source[31:28]), .out(s7), .enable(|source[31:28]));
  ssdec d6(.in(source[27:24]), .out(s6), .enable(|source[31:24]));
  ssdec d5(.in(source[23:20]), .out(s5), .enable(|source[31:20]));
  ssdec d4(.in(source[19:16]), .out(s4), .enable(|source[31:16]));
  ssdec d3(.in(source[15:12]), .out(s3), .enable(|source[31:12]));
  ssdec d2(.in(source[11: 8]), .out(s2), .enable(|source[31: 8]));
  ssdec d1(.in(source[ 7: 4]), .out(s1), .enable(|source[31: 4]));
  ssdec d0(.in(source[ 3: 0]), .out(s0), .enable(1'b1));

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
  localparam dot   = 8'b10000000;
  localparam bang  = 8'b10000110;
  localparam under = 8'b00001000;
  localparam chara = 8'b01011111; // lower case a
  localparam charb = 8'b01111100;
  localparam charB = charb; // same as lower
  localparam charC = 8'b00111001;
  localparam charc = 8'b01011000; // lower case c
  localparam chard = 8'b01011110;
  localparam charD = chard; // same as lower
  localparam charE = 8'b01111001;
  localparam charF = 8'b01110001;
  localparam charg = 8'b01101111; // it's lower case
  localparam charH = 8'b01110110; // upper case H
  localparam charh = 8'b01110100; // lower case h
  localparam charI = 8'b00110000; // same as lower case 'L'
  localparam chari = 8'b00010000; // this should be lower case
  localparam charJ = 8'b00001110;
  localparam charj = 8'b00001100; // lower case j
  localparam charL = 8'b00111000;
  localparam charl = charI; // lower case l same as 'I'
  localparam charN = 8'b00110111; // upper case n
  localparam charn = 8'b01010100; // lower case n
  localparam charO = char0; // upper case same as zero
  localparam charo = 8'b01011100; // lower case o
  localparam charP = 8'b01110011;
  localparam charq = 8'b01111011; // lower case q... sort of
  localparam charr = 8'b01010000; // lower case r
  localparam charS = 8'b01101101;
  localparam chart = 8'b01111000; // lower case t
  localparam charU = 8'b00111110; // upper case U
  localparam charu = 8'b00011100; // lower case u
  localparam chary = 8'b01101110; // lower case only

  assign {out7,out6,out5,out4,out3,out2,out1,out0} =
       bignum ? {s7,s6,s5,s4,s3,s2,s1,s0} :
       (mode == MODE_INST && numsel==NUM_EXAM) ?  { charF, charL, charA, charg,
              N?charN:under, Z?char2:under, C?charC:under, V?charU:under } :
       (mode == MODE_INST) ? { charl, charN, charS, chart, s3,s2,s1,s0 } :
       (mode == MODE_REG) ? { charr, charE, charg, blank, s3,s2,s1,s0 } :
       (mode == MODE_MEM) ? { charA, chard, chard, charr, s3,s3,s1,s0 } :
       (mode == MODE_DATA) ? { chard, chara, chart, chara, s3,s3,s1,s0 } :
       { charn, charn, charn, charn, s3,s3,s1,s0 };

  wire [4:0] key;
  wire pressed;
  scankey sk(.clk(clk), .reset(reset), .strobe(pressed), .out(key), .in(in));

  localparam KEY_Z = 5'd19;
  localparam KEY_Y = 5'd18;
  localparam KEY_X = 5'd17;
  localparam KEY_W = 5'd16;

  //===========================================================================
  // Interpret the button presses.
  //===========================================================================
  always @(posedge reset, posedge pressed)
    if (reset == 1) begin
      numsel <= NUM_ENT;
      entry <= 0;
      mode <= MODE_INST;
      bignum <= 0;
    end
    else begin
      case(key)
        KEY_Z: begin
          mode <= (mode == 2) ? 0 : mode + 1;
          bignum <= 0;
          entry <= 0;
          numsel <= NUM_ENT;
        end
        KEY_Y: ;
        KEY_X: if (mode == MODE_REG || mode == MODE_MEM) begin
            if (numsel == NUM_ENT) begin
              bignum <= 1;
              numsel <= NUM_EXAM;
            end
            else if (numsel == NUM_EXAM) begin
              bignum <= 0;
              numsel <= NUM_ENT;
            end
          end
          else if (mode == MODE_INST) begin
            if (numsel == NUM_ENT)
              numsel <= NUM_EXAM;
            else if (numsel == NUM_EXAM)
              numsel <= NUM_ENT;
          end
        KEY_W: if (mode == MODE_INST) begin
            if (fetch2) begin
              mode <= MODE_DATA;
              numsel <= NUM_MOD;
              modify <= 0;
            end
          end
          else if (mode == MODE_DATA) begin
            mode <= MODE_INST;
              numsel <= NUM_ENT;
              modify <= 0;
          end
          else begin
            if (numsel == NUM_ENT || numsel == NUM_EXAM) begin
              numsel <= NUM_MOD;
              modify <= 0;
              bignum <= 1;
            end else begin
              numsel <= NUM_ENT;
              bignum <= 0;
            end
          end
        default: case(mode)
          MODE_INST: entry <= (entry<<4)|key[3:0];
          MODE_DATA: modify <= (modify<<4)|key[3:0];
          MODE_REG: if (numsel == NUM_ENT) entry <= {28'b0,key[3:0]};
                    else if (numsel == NUM_MOD) modify <= modify<<4 | key[3:0];
          MODE_MEM: if (numsel == NUM_ENT) entry <= {13{1'b1}} & (entry<<4|key[3:0]);
                    else if (numsel == NUM_MOD) modify <= modify<<4 | key[3:0];
        endcase
      endcase
    end
  //============================================================================
  // end of interpreter
  //============================================================================

  wire [3:0] idms_wsel, idms_rsel1;
  wire idms_rwe;
  wire [3:0] wsel  = (mode==MODE_INST) ? idms_wsel : entry[3:0];
  wire [3:0] rsel1 = (mode==MODE_INST) ? idms_rsel1 : entry[3:0];
  wire [3:0] rsel2;
  wire rwe = (mode==MODE_INST) ? idms_rwe && key == KEY_W :
             (mode == MODE_REG && numsel == NUM_MOD && key == KEY_W);
  wire [1:0] regmuxsel;
  // replicate this table in the idms module.
  localparam REGMUX_ALU = 1'd0;
  localparam REGMUX_MEM = 1'd1;
  wire [31:0] regmux = regmuxsel==REGMUX_ALU ? aout :
                       regmuxsel==REGMUX_MEM ? mout : {32'b0};
  wire [31:0] regw = (mode==MODE_INST) ? regmux : modify;
  wire [31:0] r1, r2;
  regs r(.reset(reset), .clk(pressed), .wsel(wsel), .wen(rwe), .w(regw), 
         .rsel1(rsel1), .r1(r1), .rsel2(rsel2), .r2(r2));

  reg [3:0] flags;
  assign {N,Z,C,V} = flags;
  wire [31:0] aout;
  wire [3:0] flagout;
  wire [4:0] aluop;
  wire [1:0] alumuxsel;

  // replicate this table in the idms module.
  localparam ALUMUX_R2    = 2'd0;
  localparam ALUMUX_IMM8  = 2'd1;
  localparam ALUMUX_IMM16 = 2'd2;
  wire [31:0] alumux = alumuxsel==ALUMUX_R2 ? r2 :
                       alumuxsel==ALUMUX_IMM8 ? {24'b0,entry[7:0]} :
                       alumuxsel==ALUMUX_IMM16 ? {16'b0,modify[15:0]} : {32'b0};
  alu a(.out(aout), .fout(flagout), .in1(r1), .in2(alumux), .fin(flags),
        .op(aluop));

  always @(posedge reset, posedge pressed)
    if (reset == 1)
      flags <= 0;
    else if (mode == MODE_INST && fetch1 == 1 && key == KEY_W)
      flags <= flagout;

  wire idms_mwe;
  wire mwe = (mode==MODE_INST || mode==MODE_DATA) ? idms_mwe && key == KEY_W :
             (mode == MODE_MEM && numsel == NUM_MOD && key == KEY_W);
  wire [31:0] mout;
  wire [1:0] addrmuxsel;

  // Replicate this table in the idms module.
  localparam ADDRMUX_ALU   = 2'd0;
  localparam ADDRMUX_IMM16 = 2'd1;
  localparam ADDRMUX_PC    = 2'd2;
  wire [31:0] addrmux = (mode == MODE_MEM) ? entry[13:0] :
                       addrmuxsel==ADDRMUX_ALU ? aout :
                       addrmuxsel==ADDRMUX_IMM16 ? modify[15:0] : {16'b0};
  wire [31:0] memwdata = (mode == MODE_MEM) ? modify : aout;
  // mem m(.clk(pressed), .waddr(addrmux), .wen(mwe), .w(memwdata),
  //       .raddr(addrmux), .r(mout));

  //assign right = mout[7:0];
  assign examine = mode == MODE_REG ? r1 : mout;

  idms i(.clk(pressed), .enable(mode == MODE_INST && key == KEY_W),
         .inst(entry[15:0]), .immed(modify[15:0]),
         .rsel1(idms_rsel1), .rsel2(rsel2), .wsel(idms_wsel),
         .regmuxsel(regmuxsel), .rwe(idms_rwe),
         .addrmuxsel(addrmuxsel), .mwe(idms_mwe), .irl(fetch1), .iml(fetch2),
         .alumuxsel(alumuxsel), .aluop(aluop));
endmodule

/****************************************************************/
// When synthesizing with Yosys, uncomment blackboxes.
// Otherwise, keep commented.
/****************************************************************/

// (* blackbox *)
// module alu(out, fout, in1, in2, fin, op);
//      output reg [31:0] out;
//      output reg [3:0] fout;
//      input [31:0] in1, in2;
//      input [3:0] fin;
//      input [4:0] op;
// endmodule 

// (* blackbox *) 
// module ssdec (in, enable, out);
//   input [3:0] in;
//   input enable;
//   output [7:0] out;
// endmodule

// (* blackbox *) 
// module scankey (clk, reset, in, strobe, out);
//   input clk, reset;
//   input [19:0] in;
//   output strobe;
//   output [4:0] out;
// endmodule

// This is a memory.  It is a collection of flip-flops that can be written to
// and read from.  Each address represents an index into an array of 32-bit
// values.
//
module mem(clk, waddr, wen, w, raddr, r);
  input clk, wen;
  input [13:0] waddr;
  input [31:0] w;
  input [13:0] raddr;
  output reg [31:0] r;
  reg [31:0] storage[4095:0];
  always @(posedge clk) begin
    if (wen == 1)
      storage[waddr>>2] <= w;
    r <= storage[raddr>>2];
  end
endmodule


// This is a register file.
// It contains 16 32-bit registers (named R0 ... Rf)
// The register file can _simultaneously_ read any two registers
// as well as synchronously write to any register.
//
module regs(reset, clk, wsel, wen, w, rsel1, r1, rsel2, r2);
  input reset, clk;
  input [3:0] wsel, rsel1, rsel2;
  input wen;
  input [31:0] w;
  output reg [31:0] r1, r2;
  reg [31:0] r[15:0];
  always @(posedge clk, posedge reset)
    if (reset == 1) begin
      r[0] <= 0; r[1] <= 0; r[2] <= 0; r[3] <= 0;
      r[4] <= 0; r[5] <= 0; r[6] <= 0; r[7] <= 0;
      r[8] <= 0; r[9] <= 0; r[10] <= 0; r[11] <= 0;
      r[12] <= 0; r[13] <= 0; r[14] <= 0; r[15] <= 0;
    end
    else if (wen == 1)
      r[wsel] <= w;
  always @(*)
    r1 = r[rsel1];
  always @(*)
    r2 = r[rsel2];
endmodule


// This is an Instruction Decoder and Micro-Sequencer.
// It does many things that you will learn about soon enough.
//
module idms(clk, enable, inst, immed,
            rsel1, rsel2, wsel, regmuxsel, rwe,
            addrmuxsel, mwe, irl, iml,
            alumuxsel, aluop);
  input clk;
  input enable;
  input [15:0] inst;
  input [15:0] immed;
  output reg [3:0] rsel1, rsel2, wsel;
  output reg regmuxsel, rwe, mwe, irl, iml;
  output reg [5:0] aluop;
  output reg [1:0] addrmuxsel, alumuxsel;

  reg stage;

  // Replicate this table in idms module.
  localparam ALU_ADD = 5'd0;
  localparam ALU_ADC = 5'd1;
  localparam ALU_SUB = 5'd2;
  localparam ALU_SBC = 5'd3;
  localparam ALU_NEG = 5'd4;
  localparam ALU_LSL = 5'd5;
  localparam ALU_ASR = 5'd6;
  localparam ALU_LSR = 5'd7;
  localparam ALU_ROR = 5'd8;
  localparam ALU_OR  = 5'd9;
  localparam ALU_AND = 5'd10;
  localparam ALU_BIC = 5'd11;
  localparam ALU_XOR = 5'd12;
  localparam ALU_NOT = 5'd13;
  localparam ALU_SXB = 5'd14;
  localparam ALU_SXW = 5'd15;
  localparam ALU_ZXB = 5'd16;
  localparam ALU_ZXW = 5'd17;
  localparam ALU_IN1 = 5'd18;
  localparam ALU_IN2 = 5'd19;

  localparam REGMUX_ALU = 1'd0;
  localparam REGMUX_MEM = 1'd1;

  localparam ALUMUX_R2    = 2'd0;
  localparam ALUMUX_IMM8  = 2'd1;
  localparam ALUMUX_IMM16 = 2'd2;

  localparam ADDRMUX_ALU   = 2'd0;
  localparam ADDRMUX_IMM16 = 2'd1;
  localparam ADDRMUX_PC    = 2'd2;

  always @(posedge clk)
    if (enable)
      stage <= iml;

  always @(*)
    casez (inst[15:12])
      4'b0???: begin // opcodes 0 - 7: Immediate instructions
                 rsel1 = inst[11:8];
                 rsel2 = 4'd0; // not using r2
                 wsel = inst[11:8];
                 // Update the register for all but the CMPI (5) instruction.
                 rwe = (inst[15:12] == 4'h5) ? 0 : 1;
                 regmuxsel = REGMUX_ALU;
                 addrmuxsel = ADDRMUX_PC;
                 mwe = 0;
                 irl = 1;
                 iml = 0;
                 alumuxsel = ALUMUX_IMM8;
                 case (inst[15:12])
                   0: aluop = ALU_OR;
                   1: aluop = ALU_AND;
                   2: aluop = ALU_BIC;
                   3: aluop = ALU_ADD;
                   4: aluop = ALU_SUB;
                   5: aluop = ALU_SUB;
                   6: aluop = ALU_ZXB;
                   7: aluop = ALU_IN2; // Someday, this will be shift/rotate.
                 endcase
               end
      4'h8: begin // opcode 8: Two-Register Arithmetic Instructions
              rsel1 = inst[11:8];
              rsel2 = inst[3:0];
              wsel = inst[11:8];
              // write to the register for all but the CMP instruction
              rwe = inst[7:4] == 0 ? 0 : 1;
              regmuxsel = REGMUX_ALU;
              addrmuxsel = ADDRMUX_PC;
              mwe = 0;
              irl = 1;
              iml = 0;
              alumuxsel = ALUMUX_R2;
              case(inst[7:4])
                0: aluop = ALU_SUB;
                1: aluop = ALU_IN2;
                2: aluop = ALU_ADD;
                3: aluop = ALU_ADC;
                4: aluop = ALU_SUB;
                5: aluop = ALU_SBC;
                6: aluop = ALU_NEG;
                default: aluop = ALU_IN2;
              endcase
            end
      4'h9: begin // opcode 9: Two-Register Logical Instructions
              rsel1 = inst[11:8];
              rsel2 = inst[3:0];
              wsel = inst[11:8];
              rwe = inst[7:4] == 0 ? 0 : 1;
              regmuxsel = REGMUX_ALU;
              addrmuxsel = ADDRMUX_PC;
              mwe = 0;
              irl = 1;
              iml = 0;
              alumuxsel = ALUMUX_R2;
              case(inst[7:4])
                0: aluop = ALU_AND;
                1: aluop = ALU_AND;
                2: aluop = ALU_OR;
                3: aluop = ALU_BIC;
                4: aluop = ALU_XOR;
                5: aluop = ALU_NOT;
                6: aluop = ALU_ZXB;
                7: aluop = ALU_SXB;
                8: aluop = ALU_ZXW;
                9: aluop = ALU_SXW;
                default: aluop = ALU_IN2;
              endcase
            end
      4'ha: begin // Load
              rsel1 = inst[11:8]; // not looking at regs
              rsel2 = inst[11:8]; // not looking at regs
              wsel = inst[11:8];
              mwe = 0;
              if (stage == 0) begin
                rwe = 0;
                regmuxsel = REGMUX_MEM;
                addrmuxsel = ADDRMUX_IMM16;
                irl = 0;
                iml = 1;
              end
              else begin
                rwe = 1;
                regmuxsel = REGMUX_MEM;
                addrmuxsel = ADDRMUX_IMM16;
                irl = 1;
                iml = 0;
              end
              alumuxsel = ALUMUX_R2;
              aluop = ALU_IN1;
            end
      4'hc: begin // Store
              rsel1 = inst[11:8];
              rsel2 = inst[11:8];
              wsel = inst[11:8];
              rwe = 0;
              regmuxsel = REGMUX_ALU;
              if (stage == 0) begin
                addrmuxsel = ADDRMUX_IMM16;
                irl = 0;
                iml = 1;
                mwe = 0;
              end
              else begin
                addrmuxsel = ADDRMUX_IMM16;
                mwe = 0;
                irl = 1;
                iml = 0;
              end
              alumuxsel = ALUMUX_R2;
              aluop = ALU_IN1;
            end

      default: begin // All unrecognized instructions do nothing, for now.
        rwe = 0;
        mwe = 0;
        aluop = ALU_IN2;

        // Forgot to add all these other things
        rsel1 = 0;
        rsel2 = 0;
        wsel = 0;
        regmuxsel = REGMUX_ALU;
        alumuxsel = ALUMUX_R2;
        addrmuxsel = ADDRMUX_PC;
        irl = 1;
        iml = 0;
      end
    endcase

endmodule


