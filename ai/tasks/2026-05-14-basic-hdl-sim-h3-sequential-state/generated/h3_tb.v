`timescale 1ns/1ps
module logicir_h3_reg4_tb;
  reg clk;
  reg rst;
  reg [3:0] d;
  wire [3:0] q;

  logicir_h3_reg4 dut(.clk(clk), .rst(rst), .d(d), .q(q));

  initial begin
    clk = 1'b0;
    forever #5 clk = ~clk;
  end

  initial begin
    rst = 1'b1; d = 4'd9; #2;
    if (q !== 4'd0) $fatal(1, "reset failed");
    rst = 1'b0; d = 4'd6; #10;
    if (q !== 4'd6) $fatal(1, "first latch failed");
    d = 4'd12; #10;
    if (q !== 4'd12) $fatal(1, "second latch failed");
    $display("H3_PASS");
    $finish;
  end
endmodule
