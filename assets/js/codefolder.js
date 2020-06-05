start = /always ?\@\([^\)]+\)|begin|module ?[^\n]+/
end = /end|endcase|endmodule/

for (var i = 1; i < editor.session.getLength(); i++)
{
    startcheck = editor.session.getLine (i).match (start)
    if (startcheck)
    {
        
    }
}