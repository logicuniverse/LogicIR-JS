module logicir_h3_reg4(
  input wire clk,
  input wire rst,
  input wire [3:0] d,
  output reg [3:0] q
);
  always @(posedge clk or posedge rst) begin
    if (rst) begin
      q <= 4'd0;
    end else begin
      q <= d;
    end
  end
endmodule
