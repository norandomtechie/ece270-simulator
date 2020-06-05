module top (hz100, reset, pb, ss7, ss6, ss5, ss4, ss3, ss2, ss1, ss0,
            left, right, red, green, blue);
  input hz100, reset;
  input [20:0] pb;
  output [7:0] ss7, ss6, ss5, ss4, ss3, ss2, ss1, ss0, left, right;
  output red, green, blue;

  wire [15:0] y;

  hc154 u4(.e0(0), .e1(0), .a({pb[0], pb[1], pb[2], pb[3]}), .y(y));

  assign y = {left,right}; // for debugging

  wire a,b,c,d,e,f,g;
  assign ss0[6:0] = {g,f,e,d,c,b,a}; // connect A-G to ss0

  // Your segment decode statements go below.
  assign a = y[1] & y[4] & y[11] & y[13];
  assign b = y[5] & y[6] & y[11] & y[12] & y[14] & y[15];
  assign c = y[2] & y[12] & y[14] & y[15];
  assign d = y[1] & y[4] & y[7] & y[10] & y[15];
  assign e = y[1] & y[3] & y[4] & y[5] & y[7] & y[9];
  assign f = y[1] & y[2] & y[3] & y[7] & y[13];
  assign g = y[0] & y[1] & y[7] & y[12];
endmodule

module hc154(e0,e1,a,y);
  input e0, e1;
  input [3:0] a;
  output [15:0] y;

  wire en = ~e0 & ~e1;  // an output is enabled only when e0 and e1 are low.

  wire [15:0] ypos; // ypos is the positively-asserted version of the output
  assign ypos = { en &  a[3] &  a[2] &  a[1] &  a[0],
                  en &  a[3] &  a[2] &  a[1] & ~a[0],
                  en &  a[3] &  a[2] & ~a[1] &  a[0],
                  en &  a[3] &  a[2] & ~a[1] & ~a[0],
                  en &  a[3] & ~a[2] &  a[1] &  a[0],
                  en &  a[3] & ~a[2] &  a[1] & ~a[0],
                  en &  a[3] & ~a[2] & ~a[1] &  a[0],
                  en &  a[3] & ~a[2] & ~a[1] & ~a[0],
                  en & ~a[3] &  a[2] &  a[1] &  a[0],
                  en & ~a[3] &  a[2] &  a[1] & ~a[0],
                  en & ~a[3] &  a[2] & ~a[1] &  a[0],
                  en & ~a[3] &  a[2] & ~a[1] & ~a[0],
                  en & ~a[3] & ~a[2] &  a[1] &  a[0],
                  en & ~a[3] & ~a[2] &  a[1] & ~a[0],
                  en & ~a[3] & ~a[2] & ~a[1] &  a[0],
                  en & ~a[3] & ~a[2] & ~a[1] & ~a[0] };
  // construct the negatively-asserted output.
  assign y = ~ypos;
endmodule
