`timescale 1ns/1ps
module logicir_h5_and3_tb;
  reg a;
  reg b;
  reg c;
  wire y;

  logicir_h5_and3 dut(.a(a), .b(b), .c(c), .y(y));

  initial begin
    // 000
    a = 1'b0; b = 1'b0; c = 1'b0; #1;
    if (y !== 1'b0) $fatal(1, "000 y failed");
    // 001
    a = 1'b0; b = 1'b0; c = 1'b1; #1;
    if (y !== 1'b0) $fatal(1, "001 y failed");
    // 010
    a = 1'b0; b = 1'b1; c = 1'b0; #1;
    if (y !== 1'b0) $fatal(1, "010 y failed");
    // 011
    a = 1'b0; b = 1'b1; c = 1'b1; #1;
    if (y !== 1'b0) $fatal(1, "011 y failed");
    // 100
    a = 1'b1; b = 1'b0; c = 1'b0; #1;
    if (y !== 1'b0) $fatal(1, "100 y failed");
    // 101
    a = 1'b1; b = 1'b0; c = 1'b1; #1;
    if (y !== 1'b0) $fatal(1, "101 y failed");
    // 110
    a = 1'b1; b = 1'b1; c = 1'b0; #1;
    if (y !== 1'b0) $fatal(1, "110 y failed");
    // 111
    a = 1'b1; b = 1'b1; c = 1'b1; #1;
    if (y !== 1'b1) $fatal(1, "111 y failed");
    $display("H5_PASS");
    $finish;
  end
endmodule
