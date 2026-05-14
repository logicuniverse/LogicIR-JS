`timescale 1ns/1ps
module logicir_h1_and2_tb;
  reg a;
  reg b;
  wire y;

  logicir_h1_and2 dut(.a(a), .b(b), .y(y));

  initial begin
    a = 1'b0; b = 1'b0; #1; if (y !== 1'b0) $fatal(1, "00 failed");
    a = 1'b0; b = 1'b1; #1; if (y !== 1'b0) $fatal(1, "01 failed");
    a = 1'b1; b = 1'b0; #1; if (y !== 1'b0) $fatal(1, "10 failed");
    a = 1'b1; b = 1'b1; #1; if (y !== 1'b1) $fatal(1, "11 failed");
    $display("H1_PASS");
    $finish;
  end
endmodule
