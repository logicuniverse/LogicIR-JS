`timescale 1ns/1ps
module logicir_h2_add4_tb;
  reg [3:0] a;
  reg [3:0] b;
  wire [3:0] y;

  logicir_h2_add4 dut(.a(a), .b(b), .y(y));

  initial begin
    a = 4'd1; b = 4'd2; #1; if (y !== 4'd3) $fatal(1, "1+2 failed");
    a = 4'd7; b = 4'd8; #1; if (y !== 4'd15) $fatal(1, "7+8 failed");
    a = 4'd15; b = 4'd1; #1; if (y !== 4'd0) $fatal(1, "wrap failed");
    $display("H2_PASS");
    $finish;
  end
endmodule
